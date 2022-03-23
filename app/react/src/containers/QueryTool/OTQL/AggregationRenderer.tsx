import * as React from 'react';
import {
  BarChartOutlined,
  HomeOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Table, Select, Input, Card, Button as AntButton } from 'antd';
import {
  OTQLMetric,
  OTQLAggregations,
  OTQLBucket,
  OTQLBuckets,
} from '../../../models/datamart/graphdb/OTQLResult';
import { compose } from 'recompose';
import {
  Button,
  McsIcon,
  McsTabs,
  RadarChart,
  BarChart,
  PieChart,
} from '@mediarithmics-private/mcs-components-library';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { Dataset } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import {
  BarChartOptions,
  ChartConfig,
  ChartOptions,
  ChartType,
  OTQLSource,
  PieChartOptions,
  RadarChartOptions,
  SourceType,
} from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';
import {
  chartType,
  getBaseChartProps,
  getOption,
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

export interface AggregationRendererProps {
  rootAggregations: OTQLAggregations;
  datamartId: string;
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
  selectedQuickOptions: { [key: string]: string };
}

class AggregationRenderer extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

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

  componentDidMount() {
    if (this.hasDateHistogram()) this.setNbrOfShowedItems();
  }

  getDefaultView = (aggregations: OTQLAggregations) => {
    if (aggregations.buckets.length > 0) {
      return '0';
    } else {
      return 'metrics';
    }
  };

  getChartPropsMap(_chartType: chartType): any[] {
    const { selectedQuickOptions } = this.state;
    return Object.keys(selectedQuickOptions).map(selectedOptionKey => {
      return getOption(_chartType, selectedOptionKey, selectedQuickOptions[selectedOptionKey]);
    });
  }

  getChartProps = (_chartType: chartType) => {
    const chartPropsMap = this.getChartPropsMap(_chartType);
    const baseProps: ChartOptions = getBaseChartProps(_chartType);
    const newChartProps = chartPropsMap.reduce((acc, property) => {
      return { ...acc, ...property };
    }, baseProps);
    return newChartProps;
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

  setNbrOfShowedItems = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
    const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
    const value = e ? parseInt(e.target.value, 10) : MAX_ELEMENTS;
    this.setState({
      numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length, value),
    });
  };

  hasDateHistogram = () => {
    const { query } = this.props;
    return query && query.indexOf('@date_histogram') > -1;
  };

  handleChartTypeChange = (value: chartType) => {
    const defaultSelectedOptions = getQuickOptionsForChartType(value).reduce((acc, option) => {
      return { ...acc, [option.title]: option.options[0].value };
    }, {});
    this.setState({
      selectedChart: value,
      selectedQuickOptions: defaultSelectedOptions,
    });
  };

  formatDataset(buckets: OTQLBucket[], limit: number): Dataset | undefined {
    if (!buckets || buckets.length === 0) return undefined;
    else {
      const dataset: any = buckets.map(buck => {
        const children = buck.aggregations?.buckets[0]?.buckets.slice(0, limit) || [];
        const childBuckets = this.formatDataset(children, limit);
        const value = buck.aggregations?.metrics[0]
          ? buck.aggregations.metrics[0].value
          : buck.count;
        return {
          key: buck.key,
          count: value,
          buckets: childBuckets,
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
    const chartOptions = this.getChartProps(selectedChart);
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
    const dataset: OTQLSource = {
      query_id: queryResource?.id,
      type: 'OTQL' as SourceType,
    };

    const chart: ChartConfig = {
      title: '',
      type: this.adaptChartType(selectedChart),
      options: chartOptions,
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

  getBuckets = (buckets: OTQLBuckets) => {
    const { hasFeature, intl } = this.props;
    const { numberItems } = this.state;
    if (buckets.buckets.length === 0)
      return (
        <FormattedMessage
          id='queryTool.otql-result-renderer-aggrations-no-result'
          defaultMessage='No Result'
        />
      );

    const goToBucket = (bucket: OTQLBucket) => {
      if (bucket.aggregations && bucketHasData(bucket)) {
        const aggregations = bucket.aggregations;
        this.setState(prevState => ({
          aggregationsPath: [...prevState.aggregationsPath, { aggregationBucket: buckets, bucket }],
          selectedView: this.getDefaultView(aggregations),
        }));
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

    if (hasFeature('query-tool-graphs')) {
      const currentBuckets = buckets.buckets.slice(0, numberItems);
      const stackedBarChartDataset: Dataset = this.formatDataset(
        currentBuckets,
        this.state.numberItems,
      ) as Dataset;
      const radarChartDataset = currentBuckets.map(bucket => {
        return { xKey: bucket.key, value: bucket.count };
      });
      const pieChartDataset = currentBuckets.map(bucket => {
        return { key: bucket.key, value: bucket.count };
      });

      const renderShowTop = () => {
        return (
          <div className={'mcs-otqlChart_items'}>
            Show top{' '}
            <Input
              type='number'
              className='mcs-otqlChart_items_input'
              value={numberItems}
              onChange={this.setNbrOfShowedItems}
            />{' '}
            / {buckets.buckets.length}
          </div>
        );
      };

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
                dataSource={buckets.buckets}
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
              <BarChart
                {...(this.getChartProps('bar') as BarChartOptions)}
                dataset={stackedBarChartDataset ? stackedBarChartDataset : []}
                drilldown={true}
              />
            </Card>
          ),
        },
        {
          title: <RadarChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_radar' />,
          key: 'radar',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_radar'>
              <RadarChart
                {...(this.getChartProps('radar') as RadarChartOptions)}
                dataset={radarChartDataset}
              />
            </Card>
          ),
        },
        {
          title: <PieChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_pie' />,
          key: 'pie',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_pie'>
              <PieChart
                {...(this.getChartProps('pie') as PieChartOptions)}
                dataset={pieChartDataset}
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
            {renderQuickOptions(this.state.selectedChart, onChangeQuickOption)}
            {renderShowTop()}
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
      <div className='mcs-table-container'>
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
          dataSource={buckets.buckets}
          pagination={{
            size: 'small',
            showSizeChanger: true,
            hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  handleAfterChartConfigCopy = async () => {
    this.props.notifySuccess({
      message: messages.copiedToClipboard.defaultMessage,
      description: '',
    });
  };

  onSelectQuickOption(title: string, value: string) {
    const { selectedQuickOptions } = this.state;
    const newState = {
      selectedQuickOptions: {
        ...selectedQuickOptions,
        [title]: value,
      },
    };
    this.setState(newState);
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

    const goToRoot = () =>
      this.setState({
        aggregationsPath: [],
        selectedView: this.getDefaultView(aggregations),
      });

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
            this.setState({
              aggregationsPath: aggregationsPath.slice(0, index + 1),
              selectedView: this.getDefaultView(path.bucket.aggregations!),
            });
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
      selectedAggregationData = this.getBuckets(aggregations.buckets[parseInt(selectedView, 0)]);
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
