import * as React from 'react';
import {
  BarChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Table, Select, Card, Button as AntButton, Modal, Input } from 'antd';
import {
  OTQLAggregations,
  OTQLBucket,
  isOTQLAggregations,
  isAggregateDataset,
} from '../../../models/datamart/graphdb/OTQLResult';
import { IChartService } from '../../../services/ChartsService';
import { compose } from 'recompose';
import { McsIcon, McsTabs } from '@mediarithmics-private/mcs-components-library';
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
  getChartDataset,
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
import { omit } from 'lodash';
import { McsTabsItem } from './QueryToolTabsContainer';
import {
  OTQLBuckets,
  OTQLMetric,
} from '@mediarithmics-private/advanced-components/lib/models/datamart/graphdb/OTQLResult';

const messages = defineMessages({
  copiedToClipboard: {
    id: 'queryTool.AggregationRenderer.copiedToClipboard',
    defaultMessage: 'Copied chart configuration to clipboard',
  },
  share: {
    id: 'queryTool.AggregationRenderer.share',
    defaultMessage: 'Generate chart json',
  },
  chartSavePopupTitle: {
    id: 'queryTool.AggregationRenderer.savedChartPopup',
    defaultMessage: 'Save chart',
  },
  chartDeletePopupTitle: {
    id: 'queryTool.AggregationRenderer.deleteChartPopup',
    defaultMessage: 'Are you sure you want to delete this chart?',
  },
});

const MAX_ELEMENTS = 999;

interface BucketPath {
  aggregationBucket: OTQLBuckets;
  bucket: OTQLBucket;
}

// To align source and dataset when building the tree
export interface WrappedAbstractDataset {
  dataset: AbstractDataset;
}

export interface AggregationRendererProps {
  rootAggregations: OTQLAggregations | AggregateDataset;
  datamartId: string;
  tab: McsTabsItem;
  organisationId: string;
  query?: string;
  onSaveChart?: () => void;
  onDeleteChart: () => void;
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
  isSaveModalVisible: boolean;
  isDeleteModalVisible: boolean;
  chartToSaveName: string;
  selectedQuickOptions: { [key: string]: string };
}

class AggregationRenderer extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IChartService)
  private _chartService: IChartService;

  private transactionProcessor = new TransformationProcessor();

  datasetDateFormatter: DatasetDateFormatter = new DatasetDateFormatter((date, format) =>
    formatDate(date, format),
  );

  constructor(props: Props) {
    super(props);
    const defaultQuickOptions: { [key: string]: string } = props.tab.showChartLegend
      ? {}
      : {
          legend: 'no_legend',
        };
    this.state = {
      chartToSaveName: '',
      isSaveModalVisible: false,
      isDeleteModalVisible: false,
      aggregationsPath: [],
      selectedView: this.getDefaultView(props.rootAggregations),
      numberItems: this.getNumberItems(),
      selectedChart: 'table',
      selectedQuickOptions: defaultQuickOptions,
    };
  }

  getNumberItems = () => {
    const { rootAggregations } = this.props;
    if (rootAggregations) {
      if (isOTQLAggregations(rootAggregations)) {
        return rootAggregations.buckets &&
          rootAggregations.buckets[0] &&
          rootAggregations.buckets[0].buckets &&
          rootAggregations.buckets[0].buckets.length <= 6
          ? rootAggregations.buckets[0].buckets.length
          : 6;
      } else if (isAggregateDataset(rootAggregations)) {
        return rootAggregations.dataset.length <= 6 ? rootAggregations.dataset.length : 6;
      }
    }
    return 0;
  };

  private async updateDataset(chartProps: any) {
    const { rootAggregations } = this.props;
    const { selectedChart, aggregationsPath, selectedView } = this.state;
    let data;
    if (isOTQLAggregations(rootAggregations)) {
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

      const abstractDataset = getChartDataset(
        {
          dataset: aggregateDataset,
        },
        true,
        chartProps,
      );

      data = await this.applyTransformations(this.adaptChartType(selectedChart), abstractDataset);
    } else if (isAggregateDataset(rootAggregations)) {
      const abstractDataset = getChartDataset(
        {
          dataset: rootAggregations,
        },
        true,
        chartProps,
      );

      data = await this.applyTransformations(this.adaptChartType(selectedChart), abstractDataset);
    }

    this.setState({
      dataset: data,
    });
  }

  async componentDidMount() {
    if (this.hasDateHistogram()) this.setNbrOfShowedItems();
    const { selectedChart } = this.state;
    const quickOptions = this.getChartProps(selectedChart);
    await this.updateDataset(quickOptions);
  }

  getDefaultView = (aggregations: OTQLAggregations | AggregateDataset | undefined) => {
    if (aggregations && isOTQLAggregations(aggregations) && aggregations.buckets.length > 0) {
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

  private getChartProps = (_chartType: chartType) => {
    const chartPropsMap = this.getChartOptionsMap(_chartType);
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

  setNbrOfShowedItems = () => {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;
    if (isOTQLAggregations(rootAggregations)) {
      const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
      const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
      this.setState({
        numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
      });
    }
  };

  async updateAggregatePath(newAggregationPath: BucketPath[], defaultView: string) {
    const { rootAggregations } = this.props;
    const { selectedView, selectedChart } = this.state;

    if (isOTQLAggregations(rootAggregations)) {
      const aggregations = this.findAggregations(rootAggregations, newAggregationPath)!;
      const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];

      this.setState({
        aggregationsPath: newAggregationPath,
        numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
        selectedView: defaultView,
      });
    } else {
      this.setState({
        aggregationsPath: newAggregationPath,
        numberItems: Math.min(MAX_ELEMENTS, rootAggregations.dataset.length),
        selectedView: defaultView,
      });
    }
    const chartProps = this.getChartProps(selectedChart);
    await this.updateDataset(chartProps);
  }

  hasDateHistogram = () => {
    const { query } = this.props;
    return !!query && query.indexOf('@date_histogram') > -1;
  };

  handleChartTypeChange = (value: chartType) => {
    const { rootAggregations } = this.props;
    const { aggregationsPath } = this.state;
    const hasDateHistogram = this.hasDateHistogram();
    const defaultSelectedOptions = getQuickOptionsForChartType(value, hasDateHistogram).reduce(
      (acc, option) => {
        return { ...acc, [option.title]: option.options[0].value };
      },
      {},
    );
    this.setState(
      {
        selectedChart: value,
        selectedQuickOptions: defaultSelectedOptions,
      },
      () => {
        // on chart type change we also want to keep buckets view path
        if (isOTQLAggregations(rootAggregations)) {
          const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
          this.updateAggregatePath(aggregationsPath, this.getDefaultView(aggregations));
        }
      },
    );
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

  async generateChartJson(title?: string): Promise<string | undefined> {
    const { query, datamartId, rootAggregations, tab } = this.props;
    const { selectedChart } = this.state;
    let _dataset: any;
    if (isOTQLAggregations(rootAggregations)) {
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
      _dataset = {
        query_id: queryResource?.id,
        type: 'OTQL' as SourceType,
      };
    } else {
      const createQueryPromise = (
        queryText: string,
        serieTitle: string,
        type: 'join' | 'to-list',
      ) => {
        return this._queryService
          .createQuery(datamartId, {
            query_language: 'OTQL',
            query_text: queryText,
          })
          .then(res => {
            return {
              type: 'OTQL',
              query_id: res.data.id,
              series_title: serieTitle,
              operation_type: type,
            };
          });
      };
      const promises: Array<Promise<any>> = [];
      tab.serieQueries?.forEach(serieQuery => {
        if (typeof serieQuery.queryModel === 'string') {
          promises.push(createQueryPromise(serieQuery.queryModel, serieQuery.name, 'join'));
        } else {
          serieQuery.queryModel.forEach(model => {
            promises.push(createQueryPromise(model.query, model.name, 'to-list'));
          });
        }
      });
      await Promise.all(promises).then(res => {
        const getSources = (operationType: 'join' | 'to-list') => {
          return res
            .filter(r => r.operation_type === operationType)
            .map(r => {
              return {
                type: 'OTQL',
                query_id: r.query_id,
                series_title: r.series_title,
              };
            });
        };
        _dataset = {
          type: 'join',
          sources: getSources('join').concat({
            type: 'to-list',
            sources: getSources('to-list'),
          } as any),
        };
      });
    }
    const chartProps = this.getChartProps(selectedChart);
    const dataset = getChartDataset(_dataset, false, chartProps);

    const chart: ChartConfig = {
      title: title || '',
      type: this.adaptChartType(selectedChart),
      options: omit(chartProps, ['date_options']),
      dataset: dataset,
    };
    const chartConfigCopy: ChartConfig = JSON.parse(JSON.stringify(chart));
    this.cleanUnusedKeysForExport(chartConfigCopy);
    const prettyJson = JSON.stringify(snakeCaseKeys(chartConfigCopy), undefined, 2);
    return prettyJson;
  }

  async handleCopyToClipboard() {
    const prettyJson = await this.generateChartJson();
    if (!prettyJson) return;
    await this.copyTextToClipboard(prettyJson);
    return this.handleAfterChartConfigCopy();
  }

  openSaveModal() {
    this.setState({
      isSaveModalVisible: true,
    });
  }

  openDeleteModal() {
    this.setState({
      isDeleteModalVisible: true,
    });
  }

  async handleSaveChart() {
    const { organisationId, onSaveChart } = this.props;
    const { chartToSaveName } = this.state;
    this.setState({
      isSaveModalVisible: false,
    });
    const prettyJson = await this.generateChartJson(chartToSaveName);
    const parsedJson = prettyJson ? JSON.parse(prettyJson) : undefined;
    const type = (prettyJson ? JSON.parse(prettyJson) : prettyJson)?.type;
    const dashboardResource = {
      title: chartToSaveName,
      type: type || 'bars',
      content: parsedJson,
    };
    await this._chartService.createChart(organisationId, dashboardResource);
    if (onSaveChart) onSaveChart();
  }

  handleDeleteChart() {
    const { organisationId, tab, notifyError, onDeleteChart } = this.props;

    if (tab.chartItem?.id) {
      this._chartService
        .deleteChart(tab.chartItem.id, organisationId)
        .then(() => {
          this.setState(
            {
              isDeleteModalVisible: false,
            },
            () => {
              onDeleteChart();
            },
          );
        })
        .catch(err => {
          notifyError(err);
          this.setState({
            isDeleteModalVisible: false,
          });
        });
    }
  }

  private isSelectedTypeExportable(): boolean {
    const { selectedChart } = this.state;
    const { tab } = this.props;
    return selectedChart !== 'table' || tab.chartItem?.type !== 'table';
  }

  private isAggregate(dataset: AbstractDataset): dataset is AggregateDataset {
    return dataset.type === 'aggregate';
  }

  getBuckets = () => {
    const { hasFeature, intl, rootAggregations, tab } = this.props;
    const { selectedChart, dataset, aggregationsPath, selectedView } = this.state;
    const datasetOptions = this.getChartOptionsMap(selectedChart);
    const viewBuckets = isOTQLAggregations(rootAggregations)
      ? this.findAggregations(rootAggregations, aggregationsPath)?.buckets[
          parseInt(selectedView, 0)
        ]
      : undefined;
    const aggregateData = !isOTQLAggregations(rootAggregations) ? rootAggregations : undefined;

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
      } else if (aggregateData) {
        this.updateAggregatePath([], this.getDefaultView(undefined));
      }
    };

    const handleOnRow = (record: OTQLBucket) => ({
      onClick: () => goToBucket(record),
    });

    const bucketHasData = (record: OTQLBucket) => {
      return !!(
        record &&
        record.aggregations &&
        (record.aggregations.buckets.find(b => b.buckets.length > 0) ||
          record.aggregations.metrics.length > 0)
      );
    };

    const getRowClassName = (record: OTQLBucket) => {
      if (bucketHasData(record)) return 'mcs-table-cursor';
      return '';
    };
    if ((viewBuckets || aggregateData) && dataset && dataset.type === 'aggregate') {
      const aggregateDataset = dataset;
      const displayedDataset = JSON.parse(JSON.stringify(aggregateDataset));
      if (isOTQLAggregations(rootAggregations)) {
        // Reformat dataset to expected key and value
        if (selectedChart === 'radar') {
          const RADAR_Y_KEY = 'value';
          displayedDataset.dataset = displayedDataset.dataset.map((bucket: any) => {
            return { key: bucket.key, [RADAR_Y_KEY]: bucket.count };
          });
          displayedDataset.metadata = {
            seriesTitles: [RADAR_Y_KEY],
          };
        } else if (selectedChart === 'pie') {
          const PIE_Y_KEY = 'value';
          displayedDataset.dataset = displayedDataset.dataset.map((bucket: any) => {
            return { key: bucket.key, [PIE_Y_KEY]: bucket.count };
          });
          displayedDataset.metadata = {
            seriesTitles: [PIE_Y_KEY],
          };
        } else if (selectedChart === 'table') {
          displayedDataset.dataset = viewBuckets?.buckets;
        }
      }

      const tabs = [
        {
          title: <TableOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_table' />,
          key: 'table',
          display: (
            <Card bordered={false}>
              {this.renderGoToRootButton()}
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: {
                    ...omit(this.getChartProps('table'), ['date_options']),
                    handle_on_row: handleOnRow,
                    bucket_has_data: bucketHasData,
                    get_row_className: getRowClassName,
                  },
                  type: 'table',
                }}
                // TODO: improve typings in ADV library!
                formattedData={
                  {
                    metadata: {
                      seriesTitles: ['count'],
                    },
                    ...datasetOptions,
                    ...displayedDataset,
                    type: 'aggregate',
                  } as any
                }
                loading={false}
                stillLoading={false}
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
                    legend: {
                      enabled: !!tab.showChartLegend,
                    },
                    drilldown: true,
                  },
                  type: 'bars',
                }}
                formattedData={{
                  metadata: {
                    seriesTitles: ['count'],
                  },
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
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
              {this.renderGoToRootButton()}
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: {
                    ...(omit(this.getChartProps('radar'), [
                      'date_options',
                      'xKey',
                    ]) as RadarChartOptions),
                  },
                  type: 'radar',
                }}
                formattedData={{
                  metadata: {
                    seriesTitles: ['value'],
                  },
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
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
              {this.renderGoToRootButton()}
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: {
                    ...(omit(this.getChartProps('pie'), ['date_options']) as PieChartOptions),
                    legend: {
                      enabled: !!tab.showChartLegend,
                    },
                  },
                  type: 'pie',
                }}
                formattedData={{
                  metadata: {
                    seriesTitles: ['value'],
                  },
                  ...datasetOptions,
                  ...displayedDataset,
                  type: 'aggregate',
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
      const handleOnSaveButtonClick = this.openSaveModal.bind(this);
      const handleOnDeleteButtonClick = this.openDeleteModal.bind(this);
      return (
        <div>
          <McsTabs
            items={tabs}
            animated={false}
            className='mcs-otqlChart_tabs'
            onChange={this.handleChartTypeChange}
            defaultActiveKey={this.hasDateHistogram() ? 'bar' : tab.chartItem?.type || 'table'}
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
                className={
                  hasFeature('datastudio-query_tool-charts_loader')
                    ? 'mcs-otqlChart_items_share_button m-r-10'
                    : 'mcs-otqlChart_items_share_button_right'
                }
                onClick={handleCopyToClipboard}
              >
                {intl.formatMessage(messages.share)}
              </AntButton>
              {hasFeature('datastudio-query_tool-charts_loader') && (
                <React.Fragment>
                  {tab.chartItem?.id && (
                    <AntButton
                      className='mcs-otqlInputEditor_delete_button'
                      onClick={handleOnDeleteButtonClick}
                      hidden={!hasFeature('datastudio-query_tool-charts_loader')}
                    >
                      <FormattedMessage
                        id='queryTool.otql.edit.deleteChart.label'
                        defaultMessage='Delete this chart'
                      />
                    </AntButton>
                  )}
                  <AntButton
                    type='primary'
                    className='mcs-otqlInputEditor_save_button'
                    onClick={handleOnSaveButtonClick}
                    hidden={!hasFeature('datastudio-query_tool-charts_loader')}
                  >
                    <FormattedMessage
                      id='queryTool.otql.edit.new.save.label'
                      defaultMessage='{action} this chart'
                      values={{
                        action: !!tab.chartItem?.type ? 'Update' : 'Save',
                      }}
                    />
                  </AntButton>
                </React.Fragment>
              )}
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
  ): OTQLAggregations | undefined => {
    if (aggregationsPath.length === 0) return aggregations;
    const [head, ...tail] = aggregationsPath;

    const bucketAggregation = aggregations.buckets.find(
      bagg => bagg.name === head.aggregationBucket.name,
    );

    if (bucketAggregation) {
      const countBucket = bucketAggregation.buckets.find(bucket => bucket.key === head.bucket.key);

      if (countBucket && countBucket.aggregations) {
        return this.findAggregations(countBucket.aggregations, tail);
      } else return;
    } else return;
  };

  renderGoToRootButton = () => {
    const { aggregationsPath } = this.state;
    const goToRoot = () => {
      this.updateAggregatePath([], '0').then(() => this.updateAggregatePath([], '0'));
    };
    return (
      aggregationsPath.length >= 1 && (
        <button className='mcs-otqlChart_backButton' onClick={goToRoot}>
          Back
        </button>
      )
    );
  };

  render() {
    const { rootAggregations, tab } = this.props;
    const {
      aggregationsPath,
      selectedView,
      isSaveModalVisible,
      isDeleteModalVisible,
      chartToSaveName,
    } = this.state;

    const aggregations = isOTQLAggregations(rootAggregations)
      ? this.findAggregations(rootAggregations, aggregationsPath)!
      : rootAggregations;
    let selectedAggregationData = null;

    if (selectedView === 'metrics' && isOTQLAggregations(aggregations)) {
      selectedAggregationData = this.getMetrics(aggregations.metrics);
    } else {
      // selectedView is a buckets indice;
      selectedAggregationData = this.getBuckets();
    }

    const handleOnSelect = (value: string) => this.setState({ selectedView: value });

    const showSelect = isOTQLAggregations(aggregations)
      ? (aggregations.buckets.length > 0 && aggregations.metrics.length > 0) ||
        aggregations.buckets.length > 1
      : aggregations.dataset.length > 0;

    const onSaveModalClose = () => {
      this.setState({
        isSaveModalVisible: false,
      });
    };

    const onDeleteModalClose = () => {
      this.setState({
        isDeleteModalVisible: false,
      });
    };

    const handleSaveChart = this.handleSaveChart.bind(this);
    const handleDeleteChart = this.handleDeleteChart.bind(this);
    const editChartName = (name: any) => {
      this.setState({
        chartToSaveName: name.target.value || '',
      });
    };
    return (
      <div>
        <Modal
          title={<FormattedMessage {...messages.chartSavePopupTitle} />}
          wrapClassName='vertical-center-modal'
          visible={isSaveModalVisible}
          footer={
            <React.Fragment>
              <AntButton
                key='back'
                size='large'
                onClick={onSaveModalClose}
                className='mcs-aggregationRenderer_charts_return'
              >
                Return
              </AntButton>
              <AntButton
                disabled={false}
                key='submit'
                type='primary'
                size='large'
                className='mcs-aggregationRenderer_charts_submit'
                onClick={handleSaveChart}
              >
                Submit
              </AntButton>
            </React.Fragment>
          }
          onCancel={onSaveModalClose}
        >
          <Input
            value={tab.chartItem?.type ? tab.title.toString() : chartToSaveName}
            className='mcs-aggregationRenderer_chart_name'
            placeholder='Chart name'
            onChange={editChartName}
          />
        </Modal>
        <Modal
          title={<FormattedMessage {...messages.chartDeletePopupTitle} />}
          wrapClassName='vertical-center-modal'
          visible={isDeleteModalVisible}
          footer={
            <React.Fragment>
              <AntButton key='back' size='large' onClick={onDeleteModalClose}>
                Return
              </AntButton>
              <AntButton
                disabled={false}
                key='submit'
                type='primary'
                size='large'
                className='mcs-aggregationRenderer_delete_chart'
                onClick={handleDeleteChart}
              >
                Delete
              </AntButton>
            </React.Fragment>
          }
          onCancel={onDeleteModalClose}
        />
        <div style={{ marginBottom: 14 }}>
          {showSelect && isOTQLAggregations(aggregations) && (
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
                      >{`${bucket.field_name} @${bucket.bucket_type}`}</Select.Option>
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
