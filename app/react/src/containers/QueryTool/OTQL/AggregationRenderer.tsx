import * as React from 'react';
import {
  BarChartOutlined,
  HomeOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Table, Select, Card, Button as AntButton } from 'antd';
import {
  OTQLMetric,
  OTQLAggregations,
  OTQLBucket,
  OTQLBuckets,
} from '../../../models/datamart/graphdb/OTQLResult';
import { compose } from 'recompose';
import { Button, McsIcon, McsTabs } from '@mediarithmics-private/mcs-components-library';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { Dataset } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import {
  BarChartOptions,
  ChartConfig,
  ChartOptions,
  ChartType,
  PieChartOptions,
  RadarChartOptions,
} from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';

import {
  chartType,
  formatDate,
  getBaseChartProps,
  getChartOption,
  getQuickOptionsForChartType,
  renderQuickOptions,
} from './utils/ChartOptionsUtils';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';

import snakeCaseKeys from 'snakecase-keys';
import {
  DatasetDateFormatter,
  ManagedChart,
  TransformationProcessor,
} from '@mediarithmics-private/advanced-components';
import {
  AbstractDataset,
  AbstractDatasetTree,
  AggregateDataset,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';
import { SourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import {
  AbstractSource,
  OTQLSource,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/datasource_tree';
import { omit } from 'lodash';

const messages = defineMessages({
  copiedToClipboard: {
    id: 'queryTool.AggregationRenderer.copiedToClipboard',
    defaultMessage: 'Copied chart configuration to clipboard',
  },
  share: {
    id: 'queryTool.AggregationRenderer.share',
    defaultMessage: 'Generate chart json',
  },
});

const MAX_ELEMENTS = 999;

interface BucketPath {
  aggregationBucket: OTQLBuckets;
  bucket: OTQLBucket;
}

// To align source and dataset when building the tree
interface WrappedAbstractDataset {
  dataset: AbstractDataset;
}

export interface AggregationRendererProps {
  rootAggregations: OTQLAggregations;
  datamartId: string;
  organisationId: string;
  query?: string;
}
type Props = AggregationRendererProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  InjectedIntlProps;

interface State {
  aggregationsPath: BucketPath[];
  // can be a bucket or metrics
  selectedView: string;
  numberItems: number;
  selectedChart: chartType;
  dataset?: AbstractDataset;
  selectedQuickOptions: { [key: string]: string };
}

class AggregationRenderer extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  private transactionProcessor = new TransformationProcessor();

  datasetDateFormatter: DatasetDateFormatter = new DatasetDateFormatter((date, format) =>
    formatDate(date, format),
  );

  constructor(props: Props) {
    super(props);
    this.state = {
      aggregationsPath: [],
      selectedView: this.getDefaultView(props.rootAggregations),
      numberItems:
        props.rootAggregations &&
        props.rootAggregations.buckets &&
        props.rootAggregations.buckets[0] &&
        props.rootAggregations.buckets[0].buckets &&
        props.rootAggregations.buckets[0].buckets.length <= 6
          ? props.rootAggregations.buckets[0].buckets.length
          : 6,
      selectedChart: 'table',
      selectedQuickOptions: {},
    };
  }

  private async updateDataset(chartProps: any) {
    const { rootAggregations } = this.props;
    const { selectedChart, aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
    const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
    const numberOfItems = Math.min(MAX_ELEMENTS, buckets.buckets.length);
    const dataset: Dataset =
      this.formatDataset(buckets.buckets.slice(0, numberOfItems), this.state.numberItems) || [];

    const aggregateDataset: AggregateDataset = {
      type: 'aggregate',
      metadata: {
        seriesTitles: ['count'],
      },
      dataset: dataset,
    };

    const abstractDataset = this.getChartDataset(
      selectedChart,
      {
        dataset: aggregateDataset,
      },
      true,
      chartProps,
    );

    const transformed = await this.applyTransformations(
      this.adaptChartType(selectedChart),
      abstractDataset,
    );

    this.setState({
      dataset: transformed,
    });
  }

  async componentDidMount() {
    if (this.hasDateHistogram()) this.setNbrOfShowedItems();
    const { selectedChart } = this.state;
    const quickOptions = this.getChartProps(selectedChart);
    await this.updateDataset(quickOptions);
  }

  getDefaultView = (aggregations: OTQLAggregations) => {
    if (aggregations.buckets.length > 0) {
      return '0';
    } else {
      return 'metrics';
    }
  };

  private getChartOptionsMap(_chartType: chartType): any[] {
    const { selectedQuickOptions } = this.state;
    return Object.keys(selectedQuickOptions).map(selectedOptionKey => {
      return getChartOption(_chartType, selectedOptionKey, selectedQuickOptions[selectedOptionKey]);
    });
  }

  private hasPercentageTransformation(quickOptions: any): boolean {
    return quickOptions.format === 'percentage';
  }

  private hasDateFormatTransformation(quickOptions: any): boolean {
    return quickOptions.date_options && quickOptions.date_options.format !== undefined;
  }

  private getChartProps = (_chartType: chartType) => {
    const chartPropsMap = this.getChartOptionsMap(_chartType);
    const baseProps: ChartOptions = getBaseChartProps(_chartType);
    const newChartProps = chartPropsMap.reduce((acc, property) => {
      return { ...acc, ...property };
    }, baseProps);
    return newChartProps;
  };

  private getChartDataset = (
    _chartType: chartType,
    dataset: WrappedAbstractDataset | AbstractSource,
    isDataset: boolean,
    chartProps: any,
  ) => {
    const childProperty = isDataset ? 'children' : 'sources';
    let source: any = {
      type: 'otql',
      ...dataset,
    };

    if (this.hasPercentageTransformation(chartProps)) {
      source = {
        type: 'to-percentages',
        [childProperty]: [source],
      };
    }

    if (this.hasDateFormatTransformation(chartProps)) {
      source = {
        type: 'format-dates',
        date_options: chartProps.date_options,
        [childProperty]: [source],
      };
    }

    return source;
  };

  getMetrics = (metrics: OTQLMetric[] = []) => {
    if (metrics.length === 0) return null;
    return (
      <div className='mcs-table-container'>
        <Table<OTQLMetric>
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ]}
          dataSource={metrics}
          pagination={{
            size: 'small',
            showSizeChanger: true,
            hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  setNbrOfShowedItems = () => {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
    const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
    this.setState({
      numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
    });
  };

  async updateAggregatePath(newAggregationPath: BucketPath[], defaultView: string) {
    const { rootAggregations } = this.props;
    const { selectedView, selectedChart } = this.state;

    const aggregations = this.findAggregations(rootAggregations, newAggregationPath)!;
    const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];

    const chartProps = this.getChartProps(selectedChart);
    await this.updateDataset(chartProps);

    this.setState({
      aggregationsPath: newAggregationPath,
      numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
      selectedView: defaultView,
    });
  }

  hasDateHistogram = () => {
    const { query } = this.props;
    return !!query && query.indexOf('@date_histogram') > -1;
  };

  handleChartTypeChange = (value: chartType) => {
    const hasDateHistogram = this.hasDateHistogram();
    const defaultSelectedOptions = getQuickOptionsForChartType(value, hasDateHistogram).reduce(
      (acc, option) => {
        return { ...acc, [option.title]: option.options[0].value };
      },
      {},
    );
    this.setState({
      selectedChart: value,
      selectedQuickOptions: defaultSelectedOptions,
    });
  };

  private async applyTransformations(_chartType: ChartType, _dataset: AbstractDatasetTree) {
    const { organisationId, datamartId } = this.props;
    const X_KEY = 'key';
    const dataset = await this.transactionProcessor.applyTransformations(
      datamartId,
      organisationId,
      _chartType,
      X_KEY,
      _dataset,
    );
    return dataset;
  }

  formatDataset(buckets: OTQLBucket[], limit: number): Dataset | undefined {
    if (!buckets || buckets.length === 0) return undefined;
    else {
      const dataset: any = buckets.map(buck => {
        const f = this.formatDataset(
          buck.aggregations?.buckets[0].buckets.slice(0, limit) || [],
          limit,
        );
        const value = buck.aggregations?.metrics[0]
          ? buck.aggregations.metrics[0].value
          : buck.count;
        return {
          key: buck.key,
          count: value,
          buckets: f,
        };
      });
      return dataset;
    }
  }

  async copyTextToClipboard(text: string) {
    if ('clipboard' in navigator) {
      return navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  private adaptChartType(selectedChart: chartType): ChartType {
    switch (selectedChart.toLowerCase()) {
      case 'bar':
        return 'bars';
      default:
        return selectedChart as ChartType;
    }
  }

  private cleanUnusedKeysForExport(chartConfig: ChartConfig) {
    switch (chartConfig.type) {
      case 'bars':
        const barChartOptions = chartConfig.options as any;
        delete barChartOptions.xKey;
        delete barChartOptions.yKeys;
        break;
      case 'pie':
        const pieChartOptions = chartConfig.options as any;
        delete pieChartOptions.height;
        break;
    }
  }

  async handleCopyToClipboard() {
    const { query, datamartId } = this.props;
    const { selectedChart } = this.state;
    const queryResponse = await this._queryService
      .createQuery(datamartId, {
        query_language: 'OTQL',
        query_text: query,
      })
      .catch(e => {
        return undefined;
      });

    if (!queryResponse) {
      this.props.notifyError('Could not save query, please retry later');
      return;
    }

    const queryResource = queryResponse.data;
    const _dataset: OTQLSource = {
      query_id: queryResource?.id,
      type: 'OTQL' as SourceType,
    };
    const chartProps = this.getChartProps(selectedChart);
    const dataset = this.getChartDataset(selectedChart, _dataset, false, chartProps);

    const chart: ChartConfig = {
      title: '',
      type: this.adaptChartType(selectedChart),
      options: omit(chartProps, ['date_options']),
      dataset: dataset,
    };
    const chartConfigCopy: ChartConfig = JSON.parse(JSON.stringify(chart));
    this.cleanUnusedKeysForExport(chartConfigCopy);
    const prettyJson = JSON.stringify(snakeCaseKeys(chartConfigCopy), undefined, 2);
    await this.copyTextToClipboard(prettyJson);
    return this.handleAfterChartConfigCopy();
  }

  private isSelectedTypeExportable(): boolean {
    const { selectedChart } = this.state;
    return selectedChart !== 'table';
  }

  private isAggregate(dataset: AbstractDataset): dataset is AggregateDataset {
    return dataset.type === 'aggregate';
  }

  getBuckets = () => {
    const { hasFeature, intl, rootAggregations } = this.props;
    const { selectedChart, dataset, aggregationsPath, selectedView } = this.state;
    const datasetOptions = this.getChartOptionsMap(selectedChart);
    const viewBuckets = this.findAggregations(rootAggregations, aggregationsPath)?.buckets[
      parseInt(selectedView, 0)
    ];

    if (!dataset || !this.isAggregate(dataset) || dataset.dataset.length === 0)
      return (
        <FormattedMessage
          id='queryTool.otql-result-renderer-aggrations-no-result'
          defaultMessage='No Result'
        />
      );

    const goToBucket = (bucket: OTQLBucket) => {
      if (bucket.aggregations && bucketHasData(bucket) && viewBuckets) {
        const aggregations = bucket.aggregations;
        this.updateAggregatePath(
          [...aggregationsPath, { aggregationBucket: viewBuckets, bucket }],
          this.getDefaultView(aggregations),
        );
      }
    };

    const handleOnRow = (record: OTQLBucket) => ({
      onClick: () => goToBucket(record),
    });

    const bucketHasData = (record: OTQLBucket) => {
      return !!(
        record.aggregations &&
        (record.aggregations.buckets.find(b => b.buckets.length > 0) ||
          record.aggregations.metrics.length > 0)
      );
    };

    const getRowClassName = (record: OTQLBucket) => {
      if (bucketHasData(record)) return 'mcs-table-cursor';
      return '';
    };

    if (hasFeature('query-tool-graphs') && viewBuckets && dataset && dataset.type === 'aggregate') {
      const aggregateDataset = dataset as AggregateDataset;
      const displayedDataset = JSON.parse(JSON.stringify(aggregateDataset));
      // Reformat dataset to expected key and value
      if (selectedChart === 'radar') {
        displayedDataset.dataset = displayedDataset.dataset.map((bucket: any) => {
          return { xKey: bucket.key, value: bucket.count };
        });
      } else if (selectedChart === 'pie') {
        displayedDataset.dataset = displayedDataset.dataset.map((bucket: any) => {
          return { key: bucket.key, value: bucket.count };
        });
      }

      const tabs = [
        {
          title: <TableOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_table' />,
          key: 'table',
          display: (
            <Card bordered={false}>
              <Table<OTQLBucket>
                columns={[
                  {
                    title: 'Key',
                    dataIndex: 'key',
                    sorter: (a, b) =>
                      typeof a.key === 'string' &&
                      typeof b.key === 'string' &&
                      !isNaN(Date.parse(a.key)) &&
                      !isNaN(Date.parse(b.key))
                        ? Date.parse(a.key) - Date.parse(b.key)
                        : a.key.length - b.key.length,
                  },
                  {
                    title: 'Count',
                    dataIndex: 'count',
                    sorter: (a, b) => a.count - b.count,
                  },
                  {
                    render: (text, record) => {
                      if (bucketHasData(record)) {
                        return (
                          <div className='float-right'>
                            <McsIcon type='chevron-right' />
                          </div>
                        );
                      }
                      return null;
                    },
                  },
                ]}
                className='mcs-aggregationRendered_table'
                onRow={handleOnRow}
                rowClassName={getRowClassName}
                dataSource={viewBuckets?.buckets}
                pagination={{
                  size: 'small',
                  showSizeChanger: true,
                  hideOnSinglePage: true,
                }}
              />
            </Card>
          ),
        },
        {
          title: <BarChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_bar' />,
          key: 'bar',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_bar'>
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: {
                    ...(omit(this.getChartProps('bar'), ['date_options']) as BarChartOptions),
                    drilldown: true,
                  },
                  type: 'bars',
                }}
                formattedData={{
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
                  metadata: {
                    seriesTitles: ['count'],
                  },
                }}
                loading={false}
                stillLoading={false}
              />
            </Card>
          ),
        },
        {
          title: <RadarChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_radar' />,
          key: 'radar',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_radar'>
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: omit(this.getChartProps('radar'), ['date_options']) as RadarChartOptions,
                  type: 'radar',
                }}
                formattedData={{
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
                  metadata: {
                    seriesTitles: ['value'],
                  },
                }}
                loading={false}
                stillLoading={false}
              />
            </Card>
          ),
        },
        {
          title: <PieChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_pie' />,
          key: 'pie',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_pie'>
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: omit(this.getChartProps('pie'), ['date_options']) as PieChartOptions,
                  type: 'pie',
                }}
                formattedData={{
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
                  metadata: {
                    seriesTitles: ['value'],
                  },
                }}
                loading={false}
                stillLoading={false}
              />
            </Card>
          ),
        },
      ];
      const onChangeQuickOption = this.onSelectQuickOption.bind(this);
      const handleCopyToClipboard = this.handleCopyToClipboard.bind(this);
      return (
        <div>
          <McsTabs
            items={tabs}
            animated={false}
            className='mcs-otqlChart_tabs'
            onChange={this.handleChartTypeChange}
            defaultActiveKey={this.hasDateHistogram() ? 'bar' : 'table'}
          />
          <div className={'mcs-otqlChart_items_container'}>
            {renderQuickOptions(
              this.state.selectedChart,
              onChangeQuickOption,
              this.hasDateHistogram(),
            )}
          </div>
          {this.isSelectedTypeExportable() ? (
            <div className={'mcs-otqlChart_chartConfig_clipboard_container'}>
              <AntButton
                type='ghost'
                className={'mcs-otqlChart_items_share_button'}
                onClick={handleCopyToClipboard}
              >
                {intl.formatMessage(messages.share)}
              </AntButton>
            </div>
          ) : undefined}
        </div>
      );
    }
    return (
      <Table<OTQLBucket>
        columns={[
          {
            title: 'Key',
            dataIndex: 'key',
            sorter: (a, b) => a.key.length - b.key.length,
          },
          {
            title: 'Count',
            dataIndex: 'count',
            sorter: (a, b) => a.count - b.count,
          },
          {
            render: (text, record) => {
              if (bucketHasData(record)) {
                return (
                  <div className='float-right'>
                    <McsIcon type='chevron-right' />
                  </div>
                );
              }
              return null;
            },
          },
        ]}
        onRow={handleOnRow}
        rowClassName={getRowClassName}
        dataSource={viewBuckets?.buckets}
      />
    );
  };

  handleAfterChartConfigCopy = async () => {
    this.props.notifySuccess({
      message: messages.copiedToClipboard.defaultMessage,
      description: '',
    });
  };

  async onSelectQuickOption(title: string, value: string) {
    const { selectedQuickOptions, selectedChart } = this.state;
    const newState = {
      selectedQuickOptions: {
        ...selectedQuickOptions,
        [title]: value,
      },
    };
    const quickOptions = Object.keys(newState.selectedQuickOptions).map(selectedOptionKey => {
      return getChartOption(
        selectedChart,
        selectedOptionKey,
        newState.selectedQuickOptions[selectedOptionKey],
      );
    });
    const chartProps = quickOptions.reduce((acc, prop) => {
      return { ...acc, ...prop };
    }, {});
    this.setState({
      ...newState,
    });
    await this.updateDataset(chartProps);
  }

  findAggregations = (
    aggregations: OTQLAggregations,
    aggregationsPath: BucketPath[],
  ): OTQLAggregations | null => {
    if (aggregationsPath.length === 0) return aggregations;

    const [head, ...tail] = aggregationsPath;

    const bucketAggregation = aggregations.buckets.find(
      bagg => bagg.name === head.aggregationBucket.name,
    );

    if (bucketAggregation) {
      const countBucket = bucketAggregation.buckets.find(bucket => bucket.key === head.bucket.key);

      if (countBucket && countBucket.aggregations) {
        return this.findAggregations(countBucket.aggregations, tail);
      } else return null;
    } else return null;
  };

  getBreadcrumb = (aggregations: OTQLAggregations) => {
    const { aggregationsPath } = this.state;

    if (aggregationsPath.length === 0) return null;

    const goToRoot = () => this.updateAggregatePath([], this.getDefaultView(aggregations));

    return (
      <Breadcrumb style={{ marginBottom: 14 }} className='mcs-breadcrumb'>
        <Breadcrumb.Item>
          <Button onClick={goToRoot}>
            <HomeOutlined />
          </Button>
        </Breadcrumb.Item>
        {aggregationsPath.map((path, index) => {
          const isLast = index === aggregationsPath.length - 1;
          const pathToStr = `${path.aggregationBucket.field_name} @${path.aggregationBucket.type} { ${path.bucket.key} }`;
          const goToPath = () => {
            this.updateAggregatePath(
              aggregationsPath.slice(0, index + 1),
              this.getDefaultView(path.bucket.aggregations!),
            );
          };
          return (
            <Breadcrumb.Item key={index}>
              {isLast ? pathToStr : <Button onClick={goToPath}>{pathToStr}</Button>}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  render() {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
    let selectedAggregationData = null;
    if (selectedView === 'metrics') {
      selectedAggregationData = this.getMetrics(aggregations.metrics);
    } else {
      // selectedView is a buckets indice;
      selectedAggregationData = this.getBuckets();
    }

    const handleOnSelect = (value: string) => this.setState({ selectedView: value });

    const showSelect =
      (aggregations.buckets.length > 0 && aggregations.metrics.length > 0) ||
      aggregations.buckets.length > 1;

    return (
      <div>
        {this.getBreadcrumb(aggregations)}
        <div style={{ marginBottom: 14 }}>
          {showSelect && (
            <div>
              <div className='m-r-10' style={{ display: 'inline-block' }}>
                <FormattedMessage
                  id='queryTool.otql-result-renderer-aggrations-viewing'
                  defaultMessage='Viewing :'
                />
              </div>
              <Select value={selectedView} onSelect={handleOnSelect} style={{ width: 150 }}>
                {aggregations.buckets.length > 0 && (
                  <Select.OptGroup label='Buckets'>
                    {aggregations.buckets.map((bucket, index) => (
                      <Select.Option
                        key={index.toString()}
                        value={index.toString()}
                      >{`${bucket.field_name} @${bucket.type}`}</Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {aggregations.metrics.length > 0 && (
                  <Select.Option value='metrics'>Metrics</Select.Option>
                )}
              </Select>
            </div>
          )}
        </div>
        <div>{selectedAggregationData}</div>
      </div>
    );
  }
}

export default compose<{}, AggregationRendererProps>(
  injectFeatures,
  injectNotifications,
  injectIntl,
)(AggregationRenderer);
