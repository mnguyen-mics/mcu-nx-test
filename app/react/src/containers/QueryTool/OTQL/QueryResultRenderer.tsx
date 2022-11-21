import * as React from 'react';
import _, { omit } from 'lodash';
import {
  AreaChartOutlined,
  BarChartOutlined,
  BorderlessTableOutlined,
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
  isCountDataset,
  isQueryListModel,
} from '../../../models/datamart/graphdb/OTQLResult';
import { compose } from 'recompose';
import { McsIcon, McsTabs } from '@mediarithmics-private/mcs-components-library';
import { defineMessages, FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { Dataset } from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import {
  AreaChartOptions,
  ChartConfig,
  ChartOptions,
  ChartType,
  ManagedChartConfig,
  PieChartOptions,
  WithOptionalComplexXKey,
} from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';
import {
  CommonChartOptions,
  formatDate,
  getBaseChartProps,
  getChartDataset,
  getChartOption,
  getQuickOptionsByChartTypeAndDatasourceType,
  getSelectLegend,
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
  IChartService,
  ITagService,
  ManagedChart,
  TransformationProcessor,
} from '@mediarithmics-private/advanced-components';
import {
  AbstractDataset,
  AbstractDatasetTree,
  AggregateDataset,
  CountDataset,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';
import { SourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import { McsTabsItem } from './QueryToolTabsContainer';
import {
  OTQLBuckets,
  OTQLMetric,
} from '@mediarithmics-private/advanced-components/lib/models/datamart/graphdb/OTQLResult';
import { ChartResource } from '@mediarithmics-private/advanced-components/lib/models/chart/Chart';
import { AbstractSource } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/datasource_tree';
import log from '../../../utils/Logger';

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

export interface QueryResultRendererProps {
  datasource: OTQLAggregations | AggregateDataset | CountDataset;
  datamartId: string;
  tab: McsTabsItem;
  organisationId: string;
  query?: string;
  onSaveChart?: (chart: ChartResource) => void;
  onDeleteChart: () => void;
}
type Props = QueryResultRendererProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  InjectedIntlProps;

interface State {
  aggregationsPath: BucketPath[];
  // can be a bucket or metrics
  selectedView: string;
  numberItems: number;
  selectedChart: ChartType;
  dataset?: AbstractDataset;
  isSaveModalVisible: boolean;
  isDeleteModalVisible: boolean;
  chartToSaveName: string;
  selectedQuickOptions: { [key: string]: string | undefined };
  selectedQuickOptionsCache: { [key: string]: string | undefined };
  queryHasChanged: boolean;
  isDatasourceDrilldownable: boolean;
  datasourceSeriesNumber: number;
}

class QueryResultRenderer extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IChartService)
  private _chartService: IChartService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  private transactionProcessor = new TransformationProcessor();

  datasetDateFormatter: DatasetDateFormatter = new DatasetDateFormatter((date, format) =>
    formatDate(date, format),
  );

  constructor(props: Props) {
    super(props);

    const { datasource } = this.props;

    const selectedChart = isCountDataset(props.datasource)
      ? 'metric'
      : props.tab.chartItem?.type
      ? props.tab.chartItem?.type
      : this.hasDateHistogram()
      ? 'bars'
      : 'table';
    this.state = {
      chartToSaveName: props.tab.chartItem?.type ? props.tab.title.toString() : '',
      isSaveModalVisible: false,
      isDeleteModalVisible: false,
      aggregationsPath: [],
      selectedView: this.getDefaultView(props.datasource),
      numberItems: this.getNumberItems(),
      selectedChart: selectedChart,
      selectedQuickOptions: this.getQuickOptions(),
      selectedQuickOptionsCache: this.getQuickOptions(),
      queryHasChanged: false,
      isDatasourceDrilldownable: this.isDatasourceDrilldownable(datasource),
      datasourceSeriesNumber: this.getDatasourceSeriesNumber(datasource),
    };
  }

  isDatasourceDrilldownable = (datasource: OTQLAggregations | AggregateDataset | CountDataset) => {
    let isDrilldownable: boolean = false;

    if (!isOTQLAggregations(datasource)) {
      if (isAggregateDataset(datasource)) {
        datasource.dataset.forEach(datapoint => {
          if (datapoint.buckets && datapoint.buckets.length > 0) isDrilldownable = true;
        });
      }
    } else {
      datasource.buckets.forEach(bucket => {
        bucket.buckets.forEach(subbucket => {
          if (subbucket.aggregations != null) isDrilldownable = true;
        });
      });
    }

    return isDrilldownable;
  };

  getDatasourceSeriesNumber = (datasource: OTQLAggregations | AggregateDataset | CountDataset) => {
    let numberOfSeries: number;

    if (!isOTQLAggregations(datasource)) {
      if (isAggregateDataset(datasource)) {
        numberOfSeries = datasource.metadata.seriesTitles.length;
      } else {
        numberOfSeries = 0;
      }
    } else {
      numberOfSeries = datasource.metrics.length;
    }
    return numberOfSeries;
  };

  async componentDidMount() {
    if (this.hasDateHistogram()) this.setNbrOfShowedItems();
    const { selectedChart } = this.state;
    const quickOptions = this.getChartProps(selectedChart);
    await this.updateDataset(quickOptions);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      tab: { serieQueries, chartItem, title },
    } = this.props;
    const {
      tab: { serieQueries: prevSerieQueries, chartItem: prevChartItem },
    } = prevProps;
    if (!_.isEqual(serieQueries, prevSerieQueries)) {
      this.setState({
        queryHasChanged: true,
      });
    } else if (!_.isEqual(chartItem, prevChartItem)) {
      this.setState({
        chartToSaveName: title.toString(),
      });
    }
  }

  getNumberItems = () => {
    const { datasource } = this.props;
    if (datasource) {
      if (isOTQLAggregations(datasource)) {
        return datasource.buckets &&
          datasource.buckets[0] &&
          datasource.buckets[0].buckets &&
          datasource.buckets[0].buckets.length <= 6
          ? datasource.buckets[0].buckets.length
          : 6;
      } else if (isAggregateDataset(datasource)) {
        return datasource.dataset.length <= 6 ? datasource.dataset.length : 6;
      }
    }
    return 0;
  };

  private async updateDataset(chartProps: any) {
    const { datasource } = this.props;
    const { selectedChart, aggregationsPath, selectedView } = this.state;
    let data;
    let abstractDataset;
    if (isOTQLAggregations(datasource)) {
      const aggregations = this.findAggregations(datasource, aggregationsPath)!;
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

      abstractDataset = getChartDataset(
        {
          dataset: aggregateDataset,
        },
        true,
        chartProps,
      );
      try {
        data = await this.applyTransformations(selectedChart, abstractDataset);
      } catch (error) {
        log.error(error);
      }
    } else if (isAggregateDataset(datasource) || isCountDataset(datasource)) {
      abstractDataset = getChartDataset(
        {
          dataset: datasource,
        },
        true,
        chartProps,
      );
      try {
        data = await this.applyTransformations(selectedChart, abstractDataset);
      } catch (error) {
        log.error(error);
      }
    }

    this.setState({
      dataset: data,
    });
  }

  getDefaultView = (
    aggregations: OTQLAggregations | CountDataset | AggregateDataset | undefined,
  ) => {
    if (aggregations && isOTQLAggregations(aggregations) && aggregations.buckets.length > 0) {
      return '0';
    } else {
      return 'metrics';
    }
  };

  getQuickOptions = () => {
    const {
      tab: { chartItem },
    } = this.props;
    const options = chartItem?.content.options as any;
    let quickOptions: { [key: string]: any } = {};
    if (options) {
      quickOptions = {
        legend: getSelectLegend(options?.legend),
        format: options?.format,
        type: options?.type,
        pie: options?.inner_radius ? 'donut' : 'pie',
      };
    }
    const dateOptions = (chartItem as any)?.content?.dataset?.date_options;
    if (dateOptions) {
      quickOptions.date_format = dateOptions.format;
    }

    const defineDrilldownOptions = (drilldown: boolean, stacking: boolean) => {
      const options = {} as any;

      if (drilldown && !stacking) options.drilldown = 'drilldown';
      else if (!drilldown && stacking) options.drilldown = 'stacking';
      else options.drilldown = 'flat';

      return options;
    };

    if (!!options && options.drilldown !== undefined && options.stacking !== undefined) {
      quickOptions = {
        ...quickOptions,
        ...defineDrilldownOptions(options.drilldown, options.stacking),
      };
    }

    if (this.noLegendByDefault()) quickOptions = { ...quickOptions, legend: { enabled: false } };

    return quickOptions;
  };

  private getChartOptionsMap(chartType: ChartType): CommonChartOptions[] {
    const { selectedQuickOptions } = this.state;
    if (!selectedQuickOptions) {
      return [];
    } else {
      return Object.keys(selectedQuickOptions).map(selectedOptionKey => {
        return getChartOption(
          chartType,
          selectedOptionKey,
          selectedQuickOptions[selectedOptionKey],
        );
      });
    }
  }

  private getChartProps = (chartType: ChartType) => {
    const chartPropsMap: any[] = this.getChartOptionsMap(chartType);
    const baseProps: ChartOptions | undefined = getBaseChartProps(
      chartType,
      !this.noLegendByDefault(),
    );
    const newChartProps = chartPropsMap.reduce((acc, property) => {
      return { ...acc, ...property };
    }, baseProps);

    return newChartProps;
  };

  private getLoadedChartProps = (chart?: ChartResource) => {
    if (!chart) return undefined;

    const loadedChartProps = {
      ...chart.content.options,
    };

    const propsMap = new Map(Object.entries(loadedChartProps));

    const takenChartProps: any = {};

    ['drilldown', 'stacking'].forEach(property => {
      if (propsMap.has(property)) takenChartProps[property] = propsMap.get(property);
    });

    return takenChartProps;
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
    const { datasource } = this.props;
    const { aggregationsPath, selectedView } = this.state;
    if (isOTQLAggregations(datasource)) {
      const aggregations = this.findAggregations(datasource, aggregationsPath)!;
      const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
      this.setState({
        numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
      });
    }
  };

  async updateAggregatePath(newAggregationPath: BucketPath[], defaultView: string) {
    const { datasource } = this.props;
    const { selectedView, selectedChart } = this.state;

    if (isOTQLAggregations(datasource)) {
      const aggregations = this.findAggregations(datasource, newAggregationPath)!;
      const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];

      this.setState({
        aggregationsPath: newAggregationPath,
        numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length),
        selectedView: defaultView,
      });
    } else if (!isCountDataset(datasource)) {
      this.setState({
        aggregationsPath: newAggregationPath,
        numberItems: Math.min(MAX_ELEMENTS, datasource.dataset.length),
        selectedView: defaultView,
      });
    }
    const chartProps = this.getChartProps(selectedChart);
    await this.updateDataset(chartProps);
  }

  hasDateHistogram = () => {
    const {
      query,
      tab: { serieQueries },
    } = this.props;
    const audienceFeatureFormQueryHasDateHistogram =
      !!query && query.indexOf('@date_histogram') > -1;
    const serieQueryHasDateHistogram = serieQueries.some(q => {
      if (!isQueryListModel(q.queryModel)) {
        return q.queryModel.indexOf('@date_histogram') > -1;
      }
      return false;
    });
    return audienceFeatureFormQueryHasDateHistogram || serieQueryHasDateHistogram;
  };

  noLegendByDefault = () => {
    return this.getNumberOfSeries() === 1;
  };

  getNumberOfSeries = (): number => {
    const {
      tab: { queryResult },
    } = this.props;

    if (queryResult && isAggregateDataset(queryResult)) {
      return queryResult.metadata.seriesTitles.length;
    } else return -1;
  };

  handleChartTypeChange = (value: ChartType) => {
    const { datasource } = this.props;
    const {
      aggregationsPath,
      selectedQuickOptionsCache,
      isDatasourceDrilldownable,
      datasourceSeriesNumber,
    } = this.state;
    const hasDateHistogram = this.hasDateHistogram();
    const defaultSelectedOptions = getQuickOptionsByChartTypeAndDatasourceType(
      value,
      hasDateHistogram,
      isDatasourceDrilldownable,
      datasourceSeriesNumber,
    ).reduce((acc, option) => {
      return {
        ...acc,
        [option.title]: selectedQuickOptionsCache[option.title]
          ? selectedQuickOptionsCache[option.title]
          : option.title === 'legend' && this.noLegendByDefault()
          ? 'no_legend'
          : option.title === 'bar' && this.hasDateHistogram()
          ? 'column'
          : option.options[0].value,
      };
    }, {});
    this.setState(
      {
        selectedChart: value,
        selectedQuickOptions: defaultSelectedOptions,
        selectedQuickOptionsCache: { ...defaultSelectedOptions, ...selectedQuickOptionsCache },
      },
      () => {
        // on chart type change we also want to keep buckets view path
        if (isOTQLAggregations(datasource)) {
          const aggregations = this.findAggregations(datasource, aggregationsPath)!;
          this.updateAggregatePath(aggregationsPath, this.getDefaultView(aggregations));
        }
      },
    );
  };

  private async applyTransformations(chartType: ChartType, _dataset: AbstractDatasetTree) {
    const { organisationId, datamartId } = this.props;
    const X_KEY = 'key';
    const dataset = await this.transactionProcessor.applyTransformations(
      datamartId,
      organisationId,
      chartType,
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

  async generateChartJson(title?: string): Promise<string | undefined> {
    const { query, datamartId, datasource, tab } = this.props;
    const { selectedChart } = this.state;

    const buildJson = (_dataset: WrappedAbstractDataset | AbstractSource) => {
      const chartProps = { ...this.getChartProps(selectedChart) };
      const dataset = getChartDataset(_dataset, false, chartProps);

      let filteredOptions = omit(chartProps, [
        'date_options',
        'xKey',
        'yKeys',
        'height',
        'width',
        'innerRadius',
      ]);

      if (selectedChart === 'pie') {
        filteredOptions = {
          ...filteredOptions,
          innerRadius: false,
        };
      }

      const chart: ChartConfig = {
        title: title || '',
        type: selectedChart,
        options: filteredOptions,
        dataset: dataset,
      };
      const chartConfigCopy: ChartConfig = JSON.parse(JSON.stringify(chart));
      const prettyJson = JSON.stringify(snakeCaseKeys(chartConfigCopy), undefined, 2);
      return prettyJson;
    };

    if (isOTQLAggregations(datasource)) {
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
      const dataset = {
        query_id: queryResource?.id,
        type: 'OTQL' as SourceType,
      };
      return buildJson(dataset);
    } else {
      let _dataset: any;
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
          const listPromises: Array<Promise<any>> = [];
          serieQuery.queryModel.forEach(model => {
            listPromises.push(createQueryPromise(model.query, model.name, 'to-list'));
          });
          const p = new Promise((resolve, reject) => {
            return resolve({
              promises: listPromises,
            });
          });
          promises.push(p);
        }
      });
      const sources: any[] = [];
      const listSources: any[] = [];
      return Promise.all(promises).then(responses => {
        // eslint-disable-next-line
        const forEachPromise = new Promise<void>(async (resolve, reject) => {
          for (const [i, res] of responses.entries()) {
            if (res.promises) {
              const step = Promise.all(res.promises).then(r => {
                listSources.push({
                  list: r,
                });
                if (i === responses.length - 1) resolve();
              });
              await step;
            } else {
              sources.push(res);
              if (i === responses.length - 1) resolve();
            }
          }
        });

        return forEachPromise.then(() => {
          if (sources.length === 0 && listSources.length > 0) {
            _dataset = {
              type: 'join',
              sources: listSources.map((s: any) => {
                return {
                  type: 'to-list',
                  sources: s.list,
                };
              }),
            };
          } else if (sources.length === 1 && listSources.length === 0) {
            _dataset = {
              ...sources[0],
            };
          } else if (sources.length >= 1) {
            if (listSources.length === 0) {
              _dataset = {
                type: 'join',
                sources: sources,
              };
            } else {
              const toListArray = listSources.map((s: any) => {
                return {
                  type: 'to-list',
                  sources: s.list,
                };
              });
              _dataset = {
                type: 'join',
                sources: sources.concat(toListArray),
              };
            }
          }
          return buildJson(_dataset);
        });
      });
    }
  }

  async handleCopyToClipboard() {
    const prettyJson = await this.generateChartJson();
    if (!prettyJson) return;
    await this.copyTextToClipboard(prettyJson);
    return this.handleAfterChartConfigCopy();
  }

  openSaveModal(saveType: 'update' | 'save') {
    if (saveType === 'save') {
      this._tagService.pushEvent('SaveChart', 'Query tool');
    } else {
      this._tagService.pushEvent('UpdateChart', 'Query tool');
    }

    this.setState({
      isSaveModalVisible: true,
    });
  }

  openDeleteModal() {
    this.setState({
      isDeleteModalVisible: true,
    });
  }

  handleSaveChart = (chartId?: string) => async () => {
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
    const chartPromise = chartId
      ? this._chartService.updateChart(chartId, organisationId, dashboardResource)
      : this._chartService.createChart(organisationId, dashboardResource);
    chartPromise.then(res => {
      if (onSaveChart) onSaveChart(res.data);
    });
  };

  handleDeleteChart = () => {
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
  };

  private isAggregate(dataset: AbstractDataset): dataset is AggregateDataset {
    return dataset.type === 'aggregate';
  }

  getBuckets = () => {
    const { hasFeature, intl, datasource, tab, onSaveChart } = this.props;
    const {
      selectedChart,
      dataset,
      aggregationsPath,
      selectedView,
      queryHasChanged,
      selectedQuickOptions,
      isDatasourceDrilldownable,
      datasourceSeriesNumber,
    } = this.state;
    const datasetOptions = this.getChartOptionsMap(selectedChart);
    const viewBuckets = isOTQLAggregations(datasource)
      ? this.findAggregations(datasource, aggregationsPath)?.buckets[parseInt(selectedView, 0)]
      : undefined;
    const aggregateData = !isOTQLAggregations(datasource) ? datasource : undefined;

    if (!dataset || (this.isAggregate(dataset) && dataset.dataset.length === 0))
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

    // There should be no more OTQLAggration here, only datasets
    if ((viewBuckets || aggregateData) && dataset) {
      const aggregateDataset = dataset as AggregateDataset;
      const displayedDataset = JSON.parse(JSON.stringify(aggregateDataset));
      if (isOTQLAggregations(datasource)) {
        // Reformat dataset to expected key and value
        if (selectedChart === 'radar') {
          const RADAR_Y_KEY = 'value';
          const RADAR_Y_KEY_COUNT = `${RADAR_Y_KEY}-count`;
          displayedDataset.dataset = displayedDataset.dataset.map((bucket: any) => {
            return {
              key: bucket.key,
              [RADAR_Y_KEY]: bucket.count,
              [RADAR_Y_KEY_COUNT]: bucket['count-count'],
            };
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
      } else if (
        selectedChart === 'metric' &&
        (datasource as any)?.dataset &&
        (datasource as any)?.dataset[0]?.value
      ) {
        displayedDataset.value = (datasource as any)?.dataset[0]?.value;
      }

      const areaTab: ManagedChartConfig = {
        title: '',
        options: {
          ...(omit(this.getChartProps('area'), ['date_options']) as AreaChartOptions &
            WithOptionalComplexXKey),
          drilldown: true,
        },
        type: 'area',
      };

      const areaData = {
        metadata: {
          seriesTitles: ['count'],
        },
        ...datasetOptions,
        ...displayedDataset,
        type: 'aggregate',
      };

      let tabs = [
        {
          title: <BorderlessTableOutlined className='mcs-otqlChart_icons' />,
          key: 'metric',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_metric'>
              <ManagedChart
                chartConfig={{
                  title: '',
                  type: 'metric',
                }}
                formattedData={
                  {
                    metadata: {
                      seriesTitles: ['count'],
                    },
                    ...datasetOptions,
                    ...displayedDataset,
                    type: 'count',
                  } as any
                }
                loading={false}
                stillLoading={false}
              />
            </Card>
          ),
        },
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
          key: 'bars',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_bar'>
              <ManagedChart
                chartConfig={{
                  title: '',
                  options: {
                    ...this.getChartProps('bars'),
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
                    ...omit(this.getChartProps('radar'), ['date_options', 'xKey']),
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
                    ...this.getLoadedChartProps(tab.chartItem),
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
        {
          title: <AreaChartOutlined className='mcs-otqlChart_icons mcs-otqlChart_icons_area' />,
          key: 'area',
          display: (
            <Card bordered={false} className='mcs-otqlChart_content_area'>
              <ManagedChart
                chartConfig={areaTab}
                formattedData={areaData}
                loading={false}
                stillLoading={false}
              />
            </Card>
          ),
        },
      ];
      const onChangeQuickOption = this.onSelectQuickOption.bind(this);
      const handleCopyToClipboard = this.handleCopyToClipboard.bind(this);
      const handleOnSaveButtonClick = (saveType: 'update' | 'save') =>
        this.openSaveModal.bind(this, saveType);
      const handleOnDeleteButtonClick = this.openDeleteModal.bind(this);

      const isMetricCase =
        isCountDataset(datasource) ||
        ((datasource as any)?.dataset &&
          (datasource as any)?.dataset[0]?.value &&
          (datasource as any)?.type !== 'aggregate');

      if (isMetricCase) {
        tabs = tabs.filter(t => t.key === 'metric');
      } else {
        if (tab?.serieQueries.length > 1) {
          tabs = tabs.filter(t => t.key !== 'metric' && t.key !== 'pie');
        } else {
          tabs = tabs.filter(t => t.key !== 'metric');
        }
      }

      const quickOptions = _.omitBy(selectedQuickOptions, _.isUndefined);

      return (
        <div>
          <McsTabs
            items={tabs}
            animated={false}
            className='mcs-otqlChart_tabs'
            onChange={this.handleChartTypeChange}
            defaultActiveKey={selectedChart}
          />
          <div className={'mcs-otqlChart_items_container'}>
            {!isMetricCase &&
              renderQuickOptions(
                selectedChart,
                onChangeQuickOption,
                this.hasDateHistogram(),
                quickOptions,
                isDatasourceDrilldownable,
                datasourceSeriesNumber,
              )}
          </div>
          {onSaveChart ? (
            <div className={'mcs-otqlChart_chartConfig_clipboard_container'}>
              {hasFeature('datastudio-query_tool-charts_loader') && tab.chartItem?.id && (
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
              {!hasFeature('datastudio-query_tool-charts_loader') && (
                <AntButton type='ghost' onClick={handleCopyToClipboard}>
                  {intl.formatMessage(messages.share)}
                </AntButton>
              )}
              {hasFeature('datastudio-query_tool-charts_loader') && (
                <AntButton
                  type='primary'
                  className='mcs-otqlInputEditor_save_button'
                  onClick={handleOnSaveButtonClick(!!tab.chartItem?.type ? 'update' : 'save')}
                  hidden={!hasFeature('datastudio-query_tool-charts_loader')}
                  disabled={queryHasChanged}
                >
                  <FormattedMessage
                    id='queryTool.otql.edit.new.save.label'
                    defaultMessage='{action} this chart'
                    values={{
                      action: !!tab.chartItem?.type ? 'Update' : 'Save',
                    }}
                  />
                </AntButton>
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
    const { selectedQuickOptions, selectedQuickOptionsCache, selectedChart } = this.state;
    const newState = {
      selectedQuickOptions: {
        ...selectedQuickOptions,
        [title]: value,
      },
      selectedQuickOptionsCache: {
        ...selectedQuickOptionsCache,
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
    const { datasource, tab } = this.props;
    const {
      aggregationsPath,
      selectedView,
      isSaveModalVisible,
      isDeleteModalVisible,
      chartToSaveName,
    } = this.state;

    const aggregations = isOTQLAggregations(datasource)
      ? this.findAggregations(datasource, aggregationsPath)!
      : datasource;
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
      : !isCountDataset(aggregations)
      ? aggregations.dataset.length > 0
      : false;

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
                disabled={!chartToSaveName}
                key='submit'
                type='primary'
                size='large'
                className='mcs-aggregationRenderer_charts_submit'
                onClick={this.handleSaveChart(tab.chartItem?.id)}
              >
                Submit
              </AntButton>
            </React.Fragment>
          }
          onCancel={onSaveModalClose}
        >
          <Input
            value={chartToSaveName}
            className='mcs-aggregationRenderer_chart_name'
            placeholder='Chart name'
            onChange={editChartName}
          />
        </Modal>
        <Modal
          title={
            <FormattedMessage
              id='queryTool.AggregationRenderer.deleteChartPopup'
              defaultMessage='Are you sure you want to delete {chartName} ?'
              values={{
                chartName: tab.chartItem?.title,
              }}
            />
          }
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
                onClick={this.handleDeleteChart}
              >
                Delete
              </AntButton>
            </React.Fragment>
          }
          onCancel={onDeleteModalClose}
        />
        <div>
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

export default compose<{}, QueryResultRendererProps>(
  injectFeatures,
  injectNotifications,
  injectIntl,
)(QueryResultRenderer);
