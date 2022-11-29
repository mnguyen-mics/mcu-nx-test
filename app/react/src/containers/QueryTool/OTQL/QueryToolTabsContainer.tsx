import * as React from 'react';
import { Alert, Button, Layout, message, Row, Tabs } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl';
import { CancelablePromise } from '../../../utils/ApiHelper';
import {
  isQueryListModel,
  OTQLResult,
  QueryPrecisionMode,
} from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import SchemaVizualizer from '../../Audience/AdvancedSegmentBuilder/SchemaVisualizer/SchemaVizualizer';
import { computeFinalSchemaItem } from '../../Audience/AdvancedSegmentBuilder/domain';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import QueryToolTab, {
  AbstractListQueryModel,
  AbstractQueryModel,
  OTQLQueryModel,
  QueryModelType,
  SerieQueryModel,
} from './QueryToolTab';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery, getSources } from './utils/QueryUtils';
import {
  IChartDatasetService,
  QueryExecutionSource,
  QueryExecutionSubSource,
  ChartsSearchPanel,
  IChartService,
  ITagService,
} from '@mediarithmics-private/advanced-components';
import cuid from 'cuid';
import { AggregateDataset } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';
import { SourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import { ChartResource } from '@mediarithmics-private/advanced-components/lib/models/chart/Chart';
import {
  AbstractParentSource,
  AbstractSource,
  OTQLSource,
  AnalyticsSource,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/datasource_tree';
import { QueryToolTabContext } from './QueryToolTabContext';
import {
  AnalyticsDimension,
  AnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';

const messages = defineMessages({
  queryToSave: {
    id: 'queryTool.OtqlConsole.tab.queryToSave',
    defaultMessage: 'Query to save',
  },
  chartSaved: {
    id: 'queryTool.OtqlConsole.tab.chartSaved',
    defaultMessage: 'Chart is saved',
  },
  chartDeleted: {
    id: 'queryTool.OtqlConsole.tab.chartDeleted',
    defaultMessage: 'Chart is deleted',
  },
  shareButton: {
    id: 'queryTool.OtqlConsole.tab.shareButton',
    defaultMessage: 'Share',
  },
  chartShared: {
    id: 'queryTool.OtqlConsole.tab.chartShared',
    defaultMessage: 'The chart URL is copied to the clipboard',
  },
  clearTabs: {
    id: 'queryTool.OtqlConsole.tab.clearTabs',
    defaultMessage: 'Clear tabs',
  },
});

const { Content } = Layout;
const { TabPane } = Tabs;

interface SerializableMcsTabsItem {
  title: React.ReactChild;
  key: string;
  closable: boolean;
  serieQueries: SerieQueryModel[];
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  chartItem?: ChartResource;
}

export interface McsTabsItem extends SerializableMcsTabsItem {
  className?: string;
  display?: JSX.Element;
  runningQuery: boolean;
  queryResult: OTQLResult | AggregateDataset | null;
  queryAborted: boolean;
  error?: any;
}

export interface QueryToolTabsContainerProps {
  datamartId: string;
  renderActionBar?: (query: string, datamartId: string) => React.ReactNode;
  query?: string;
  queryEditorClassName?: string;
  editionMode?: boolean;
  createdQueryId?: string;
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
  renderSaveAsButton?: (query: string, datamartId: string) => React.ReactNode;
}

interface State {
  schemaVizOpen: boolean;
  schemaLoading: boolean;
  tabs: McsTabsItem[];
  activeKey: string;
  loaded: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  noLiveSchemaFound: boolean;
  chartsSearchPanelKey: string;
}

type Props = QueryToolTabsContainerProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

interface SavedQuery {
  activeKey: string;
  queries: SerializableMcsTabsItem[];
  updateTs: number;
}

type SavedQueriesMap = Record<string, SavedQuery>;

class QueryToolTabsContainer extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IChartDatasetService)
  private _chartDatasetService: IChartDatasetService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  @lazyInject(TYPES.IChartService)
  private _chartService: IChartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      schemaVizOpen: true,
      schemaLoading: false,
      noLiveSchemaFound: false,
      activeKey: '1',
      tabs: [],
      chartsSearchPanelKey: cuid(),
      loaded: false,
    };
  }

  async componentDidMount() {
    const { datamartId, editionMode, intl } = this.props;
    await this.fetchObjectTypes(datamartId);
    if (editionMode) {
      this.setState({
        tabs: [
          {
            title: intl.formatMessage(messages.queryToSave),
            key: '1',
            closable: false,
            serieQueries: this.getDefaultSerieQuery(),
            precision: 'FULL_PRECISION',
            evaluateGraphQl: true,
            useCache: false,
            runningQuery: false,
            queryResult: null,
            queryAborted: false,
            error: undefined,
          },
        ],
      });
    } else {
      this.initTabState();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { datamartId } = this.props;
    const { datamartId: prevDatamartId } = prevProps;
    if (prevDatamartId !== datamartId) {
      this.setState(
        {
          tabs: [],
          activeKey: '1',
          loaded: false,
        },
        () => {
          this.initTabState();
        },
      );
      this.fetchObjectTypes(datamartId);
      return;
    }
    this.saveTabStateToLocalStorage(this.state, datamartId);
  }

  saveTabStateToLocalStorage = (state: State, datamartId: string): void => {
    const { tabs, activeKey, loaded } = state;
    if (!loaded) {
      return;
    }
    const maxNumberOfSavedQueries = localStorage.getItem('maxNumberOfSavedQueries') ?? 100;
    const currentSavedQueries: SavedQueriesMap = JSON.parse(
      localStorage.getItem('savedQueries') ?? '{}',
    );
    const tabQueries = tabs.map((tab: McsTabsItem): SerializableMcsTabsItem => {
      return {
        title: tab.title,
        key: tab.key,
        closable: tab.closable,
        serieQueries: tab.serieQueries,
        precision: tab.precision,
        evaluateGraphQl: tab.evaluateGraphQl,
        useCache: tab.useCache,
        chartItem: tab.chartItem,
      };
    });
    const newSavedQueries = {
      ...currentSavedQueries,
      [datamartId]: { updateTs: new Date().getTime(), queries: tabQueries, activeKey },
    };

    // This code is to drop the oldest saved tabs when the limit (arbitrarily set to 100)
    // is reached. This is to avoid bloat in the localStorage.
    const numSavedQueries = Object.values(newSavedQueries).reduce(
      (acc, savedQueries) => acc + savedQueries.queries.length,
      0,
    );
    if (numSavedQueries > maxNumberOfSavedQueries) {
      const sortedByOldestUpdate = Object.entries(newSavedQueries).sort(
        (savedQuery1, savedQuery2) => savedQuery1[1].updateTs - savedQuery2[1].updateTs,
      );
      const oldestEditedDatamart = sortedByOldestUpdate[0][0];
      newSavedQueries[oldestEditedDatamart].queries.pop();
    }
    localStorage.setItem('savedQueries', JSON.stringify(newSavedQueries));
  };

  initTabState = async (): Promise<void> => {
    const { datamartId, location, match } = this.props;
    const { organisationId } = match.params;

    // Load tab state from LocalStorage
    let savedQueries: SavedQuery | undefined = JSON.parse(
      localStorage.getItem('savedQueries') ?? '{}',
    )[datamartId];

    // Reset savedQueries if it matches the old data model
    if (typeof savedQueries?.queries?.[0]?.serieQueries?.[0]?.queryModel === 'string') {
      savedQueries = undefined;
      localStorage.removeItem('savedQueries');
    }

    // Get McsTabsItem from local storage
    const tabs: McsTabsItem[] =
      savedQueries?.queries.map(tabQueries => ({
        ...tabQueries,
        runningQuery: false,
        queryAborted: false,
        queryResult: null,
      })) || [];

    // Set activeKey from localStorage
    let activeKey = this.getValidActiveKey(tabs, savedQueries?.activeKey);

    // If we have data in local storage, init them in state
    // or add the default query tab
    if (tabs.length > 0) {
      this.setState({ tabs, activeKey, loaded: true });
    } else {
      this.setState({ loaded: true }, () => {
        this.addNewTab(true);
      });
    }

    // Search for chartId in tabs from local storage
    const chartId = new URLSearchParams(location.search).get('chartId') || '';
    const chartTab = tabs.find(tab => tab.chartItem?.id === chartId);

    // Set activeKey matching chartId in localStorage
    // and launch query in current tab
    if (chartTab) {
      activeKey = chartTab.key;
      if (chartTab.chartItem) {
        this.setState({ activeKey });
        await this.launchQuery(chartTab.chartItem);
      }
    }

    // if chartId parameter is specified, but not in localStorage state,
    // and launch query in a new tab
    if (chartId && !chartTab) {
      const chart = await this._chartService.getChart(chartId, organisationId);
      this.addNewTab();
      await this.launchQuery(chart.data);
    }
  };

  getValidActiveKey = (tabs: McsTabsItem[], activeKey = '1'): string => {
    const tabKeys = tabs.map(tab => tab.key);
    // If the saved active key is in the available ones, great don't change it
    if (tabKeys.includes(activeKey)) {
      return activeKey;
    }
    // If there are no available queries saved (I don't know how it could happen, but...)
    // Return the '1' key which should correspond to the first tab
    if (tabKeys.length === 0) {
      return '1';
    }
    // Otherwise, return the last element of the available keys. (key corresponding to the last tab)
    return tabKeys[-1];
  };

  getDefaultSerieQuery = () => {
    return [getNewSerieQuery('Series 1', this.getInitialQuery())];
  };

  getInitialQuery = (): string => {
    const { editionMode, query } = this.props;
    return editionMode && query ? query : DEFAULT_OTQL_QUERY;
  };

  fetchObjectTypes = async (datamartId: string) => {
    this.setState({
      schemaLoading: true,
      noLiveSchemaFound: false,
      tabs: this.state.tabs.map(t => {
        return {
          ...t,
          error: null,
        };
      }),
    });
    return this._runtimeSchemaService
      .getRuntimeSchemas(datamartId)
      .then(schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) {
          this.setState({
            noLiveSchemaFound: true,
          });
          return [];
        }
        return this._runtimeSchemaService.getObjectTypeInfoResources(datamartId, liveSchema.id);
      })
      .then(r => {
        this.setState({ rawSchema: r, schemaLoading: false });
        return r;
      })
      .catch(err => {
        this.setState({
          tabs: this.state.tabs.map(t => {
            return {
              ...t,
              error: err,
            };
          }),
          schemaLoading: false,
        });
      });
  };

  runQuery = () => {
    const { activeKey, tabs } = this.state;
    const tabQuery = tabs.find(tab => tab.key === activeKey);
    if (tabQuery) {
      this.setState(
        {
          tabs: tabs.map(t => {
            if (t.key === activeKey) {
              return {
                ...t,
                runningQuery: true,
                queryResult: null,
                error: undefined,
                queryAborted: false,
              };
            } else return t;
          }),
        },
        () => {
          this.fetchQuerySeriesDataset(tabQuery);
        },
      );
    }
  };

  updateQueryModel = (serieId: string, subStepId?: string) => (query: AbstractQueryModel) => {
    const { activeKey, tabs } = this.state;
    const { editionMode } = this.props;
    if (editionMode) {
      this.setState({
        tabs: tabs.map(tab => {
          if (tab.key === activeKey) {
            return {
              ...tab,
              serieQueries: [
                {
                  id: '',
                  name: '',
                  queryModel: query,
                },
              ],
            };
          } else return tab;
        }),
      });
    } else {
      this.setState({
        tabs: tabs.map(tab => {
          if (tab.key === activeKey) {
            return {
              ...tab,
              serieQueries: tab.serieQueries.map(serie => {
                const serieQueryModel = serie.queryModel;
                if (isQueryListModel(serieQueryModel) && subStepId) {
                  return {
                    ...serie,
                    queryModel: serieQueryModel.map(model => {
                      if (model.id === subStepId) {
                        return {
                          ...model,
                          queryModel: query,
                        };
                      }
                      return model;
                    }),
                  };
                } else {
                  if (serie.id === serieId) {
                    return {
                      ...serie,
                      queryModel: query,
                    };
                  }
                  return serie;
                }
              }),
            };
          } else return tab;
        }),
      });
    }
  };

  updateTree = (
    serieId: string,
    event: any,
    inputVisible: boolean,
    serieQueries: SerieQueryModel[],
    subStepId?: string,
  ) => {
    return serieQueries.map(serie => {
      const serieQueryModel = serie.queryModel;
      if (isQueryListModel(serieQueryModel) && subStepId) {
        return {
          ...serie,
          queryModel: serieQueryModel.map(model => {
            if (model.id === subStepId) {
              return {
                ...model,
                inputVisible: inputVisible,
                name: event.target.value,
              };
            }
            return model;
          }),
        };
      } else {
        if (serie.id === serieId) {
          return {
            ...serie,
            inputVisible: inputVisible,
            name: event.target.value,
          };
        }
        return serie;
      }
    });
  };

  updateNameModel = (serieId: string, subStepId?: string) => (event: any) => {
    const { activeKey, tabs } = this.state;
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: this.updateTree(serieId, event, false, tab.serieQueries, subStepId),
          };
        } else return tab;
      }),
    });
  };

  onInputChange = (serieId: string, subStepId?: string) => (event: any) => {
    const { activeKey, tabs } = this.state;
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: this.updateTree(serieId, event, true, tab.serieQueries, subStepId),
          };
        } else return tab;
      }),
    });
  };

  displaySerieInput = (serieId: string, subStepId?: string) => (e: any) => {
    const { activeKey, tabs } = this.state;

    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: tab.serieQueries.map(serie => {
              const serieQueryModel = serie.queryModel;
              if (isQueryListModel(serieQueryModel) && subStepId) {
                return {
                  ...serie,
                  queryModel: serieQueryModel.map(model => {
                    if (model.id === subStepId) {
                      return {
                        ...model,
                        inputVisible: !model.inputVisible,
                      };
                    }
                    return model;
                  }),
                };
              } else {
                if (serie.id === serieId) {
                  return {
                    ...serie,
                    inputVisible: !serie.inputVisible,
                  };
                }
                return serie;
              }
            }),
          };
        } else return tab;
      }),
    });
  };

  fetchQuerySeriesDataset = async (tabQuery: McsTabsItem) => {
    const {
      datamartId,
      match: {
        params: { organisationId },
      },
      queryExecutionSource,
      queryExecutionSubSource,
    } = this.props;
    const { tabs, activeKey } = this.state;
    // TODO: improve typings of 'sources' and chart configs in ADV library

    let dataset;
    const serieQueries = tabs.find(t => t.key === activeKey)?.serieQueries;
    if (serieQueries && serieQueries.length === 1) {
      if (isQueryListModel(serieQueries[0].queryModel))
        dataset = {
          type: 'to-list',
          ...getSources(tabQuery)[0],
        } as any;
      else
        dataset = {
          type: serieQueries[0].type,
          ...getSources(tabQuery)[0],
        } as any;
    } else {
      dataset = {
        type: 'join',
        sources: getSources(tabQuery),
      };
    }
    return this._chartDatasetService
      .fetchDataset(
        datamartId,
        organisationId,
        {
          title: '',
          type: tabQuery.chartItem?.type || 'table',
          dataset,
          useCache: tabQuery.useCache,
        },
        queryExecutionSource,
        queryExecutionSubSource,
      )
      .then(res => {
        const response = res as any;
        this.setState({
          tabs: tabs.map(tab => {
            if (tab.key === activeKey) {
              return {
                ...tab,
                runningQuery: false,
                queryResult: response,
              };
            } else return tab;
          }),
        });
      })
      .catch(error => {
        this.setState({
          tabs: tabs.map(tab => {
            if (tab.key === activeKey) {
              return {
                ...tab,
                error: !error.isCanceled ? error : null,
                runningQuery: false,
              };
            } else return tab;
          }),
        });
      });
  };

  abortQuery = () => {
    const { tabs, activeKey } = this.state;
    this.asyncQuery?.cancel();
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            queryAborted: true,
            runningQuery: false,
          };
        } else return tab;
      }),
    });
  };

  dismissError = () => {
    const { tabs, activeKey } = this.state;
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            error: null,
          };
        } else return tab;
      }),
    });
  };

  onSeriesChange = (newSeries: SerieQueryModel[]) => {
    const { tabs, activeKey } = this.state;
    this.setState({
      tabs: tabs?.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: newSeries,
          };
        } else return tab;
      }),
    });
  };

  onChange = (activeKey: string) => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey: string, action: string) => {
    if (action === 'add') {
      this.addNewTab();
    } else {
      // @ts-expect-error
      this[action](targetKey);
    }
  };

  remove = (targetKey: string) => {
    const { tabs, activeKey } = this.state;
    let newActiveKey = activeKey;
    let lastIndex;
    tabs.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newTabs = tabs.filter(pane => pane.key !== targetKey);

    if (newTabs.length && newActiveKey === targetKey) {
      if (lastIndex && lastIndex >= 0) {
        newActiveKey = newTabs[lastIndex].key;
      } else {
        newActiveKey = newTabs[0].key;
      }
    }
    if (newTabs.length === 1) {
      newTabs[0].closable = false;
    }

    this.setState({
      tabs: newTabs,
      activeKey: newActiveKey,
    });
  };

  addNewTab = (force_clear = false, mcsTabsItemOverride: Partial<McsTabsItem> = {}) => {
    const { tabs } = this.state;

    if (tabs.length === 1) {
      tabs[0].closable = true;
    }

    const newTabs = force_clear ? [] : [...tabs];

    const newKey = newTabs.length > 0 ? parseInt(newTabs[newTabs.length - 1].key, 10) + 1 : 1;
    const activeKey = newKey.toString();
    newTabs.push({
      title: `Query ${newKey}`,
      key: activeKey,
      closable: this.state.tabs.length > 0,
      serieQueries: this.getDefaultSerieQuery(),
      runningQuery: false,
      queryAborted: false,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      queryResult: null,
      ...mcsTabsItemOverride,
    });

    this.setState({
      tabs: newTabs,
      activeKey,
    });
  };

  renderSchemaVisualizer = (startType: string) => {
    const { rawSchema } = this.state;

    return (
      <div className='schema-visualizer'>
        <SchemaVizualizer
          schema={
            rawSchema && rawSchema.length > 0
              ? computeFinalSchemaItem(rawSchema, startType, false, false, false)
              : undefined
          }
          disableDragAndDrop={true}
        />
      </div>
    );
  };

  getStringFirstQuery = () => {
    const { tabs } = this.state;
    const firstTabQuery = tabs.find(t => t.key === '1');
    const queryToUse =
      firstTabQuery && firstTabQuery.serieQueries[0]?.type === 'otql'
        ? (firstTabQuery.serieQueries[0]?.queryModel as OTQLQueryModel).query
        : DEFAULT_OTQL_QUERY;
    return queryToUse;
  };

  onSaveChart = (chartItem: ChartResource) => {
    const { intl } = this.props;
    const { tabs, activeKey } = this.state;
    this.props.notifySuccess({
      message: intl.formatMessage(messages.chartSaved),
      description: '',
    });

    this.setState({
      chartsSearchPanelKey: cuid(),
      tabs: tabs.map(tab => {
        if (activeKey === tab.key) {
          return {
            ...tab,
            chartItem: chartItem,
            title: chartItem.title,
          };
        } else return tab;
      }),
    });
  };

  onDeleteChart = () => {
    const { intl } = this.props;
    const { tabs, activeKey } = this.state;
    this.props.notifySuccess({
      message: intl.formatMessage(messages.chartDeleted),
      description: '',
    });
    this.setState({
      tabs: tabs.map(tab => {
        if (activeKey === tab.key) {
          return {
            ...tab,
            chartItem: undefined,
          };
        } else return tab;
      }),
    });
  };

  setNewSerieQueries = (serieQueries: SerieQueryModel[], chartItem: ChartResource) => {
    const { tabs, activeKey } = this.state;
    const newTabs = tabs.map(tab => {
      if (activeKey === tab.key) {
        return {
          ...tab,
          title: chartItem.title,
          serieQueries: serieQueries,
          chartItem: chartItem,
        };
      } else return tab;
    });

    this.setState(
      {
        tabs: newTabs,
      },
      () => {
        this.runQuery();
      },
    );
  };

  launchQuery = async (chartItem: ChartResource) => {
    const { datamartId, notifyError } = this.props;

    const dataset = chartItem.content.dataset;

    const buildSerieQueryTree = (sources: AbstractSource[], sourceType: SourceType) => {
      const queryPromises: Array<Promise<Partial<AbstractListQueryModel | AbstractParentSource>>> =
        sources.map(s => {
          const queryId = (s as OTQLSource).query_id;
          const queryJson = (s as AnalyticsSource<AnalyticsMetric, AnalyticsDimension>).query_json;
          if (queryId) {
            return this._queryService.getQuery(datamartId, queryId).then(res => {
              return {
                id: cuid(),
                queryModel: { query: res.data.query_text },
                name: s.series_title || '',
                type: 'otql' as QueryModelType,
              };
            });
          } else if (queryJson)
            return Promise.resolve({
              id: cuid(),
              name: s.series_title || '',
              queryModel: (s as AnalyticsSource<AnalyticsMetric, AnalyticsDimension>).query_json,
              type: s.type as QueryModelType,
            });
          else return Promise.resolve({ sources: (s as AbstractParentSource).sources });
        });

      Promise.all(queryPromises)
        .then(async queryResponses => {
          const newSerieQueries: SerieQueryModel[] = [];
          const promiseLoop = async () => {
            if (sourceType === 'to-list') {
              newSerieQueries.push({
                id: cuid(),
                name: '',
                inputVisible: false,
                queryModel: [],
              });
            }
            for (const [i, res] of queryResponses.entries()) {
              // If sources
              const sources = (res as AbstractParentSource).sources;
              if (sources) {
                const subQueryPromises: Array<Promise<any>> = sources.map(s => {
                  const queryId = (s as OTQLSource).query_id;
                  if (queryId)
                    return this._queryService.getQuery(datamartId, queryId).then(queryRes => {
                      return Promise.resolve({
                        name: s.series_title,
                        operation_type: (s as any).operation_type,
                        queryModel: { query: queryRes.data.query_text },
                        type: 'otql' as QueryModelType,
                      });
                    });
                  else
                    return Promise.resolve({
                      name: s.series_title,
                      operation_type: (s as any).operation_type,
                      queryModel: (s as AnalyticsSource<AnalyticsMetric, AnalyticsDimension>)
                        .query_json,
                      type: s.type as QueryModelType,
                    });
                });
                await Promise.all(subQueryPromises)
                  .then(subResponse => {
                    if (subResponse[0].operation_type === 'join') {
                      subResponse.forEach(resp => {
                        newSerieQueries.push({
                          id: cuid(),
                          name: resp.name || '',
                          inputVisible: false,
                          queryModel: resp.queryModel,
                          type: resp.type,
                        });
                      });
                    } else {
                      newSerieQueries.push({
                        id: cuid(),
                        name: `Serie ${i}`,
                        inputVisible: false,
                        queryModel:
                          subResponse.length === 1
                            ? subResponse[0].queryModel
                            : subResponse.map((source, j) => {
                                return {
                                  queryModel: source.queryModel,
                                  id: cuid(),
                                  name: source.name || `Dimension ${j}`,
                                  inputVisible: false,
                                  type: source.type,
                                };
                              }),
                        type: subResponse.length === 1 ? subResponse[0].type : undefined,
                      });
                    }
                  })
                  .catch(err => {
                    notifyError(err);
                  });
              } else {
                const serieQuery = res as SerieQueryModel;
                if (sourceType === 'to-list' && isQueryListModel(serieQuery.queryModel)) {
                  newSerieQueries[0].queryModel = serieQuery.queryModel as AbstractListQueryModel[];
                } else {
                  const serieQuery = res as SerieQueryModel;
                  newSerieQueries.push({
                    id: cuid(),
                    name: serieQuery.name || '',
                    inputVisible: false,
                    queryModel: serieQuery.queryModel || '',
                    type: serieQuery.type,
                  });
                }
              }
              if (queryResponses.length - 1 === i) {
                this.setNewSerieQueries(newSerieQueries, chartItem);
              }
            }
          };
          promiseLoop();
        })

        .catch(err => {
          notifyError(err);
        });
    };
    switch (dataset.type.toLowerCase()) {
      case 'otql':
        const queryId = (dataset as OTQLSource).query_id;
        if (queryId) {
          this._queryService
            .getQuery(datamartId, queryId)
            .then(res => {
              this.setNewSerieQueries(
                [
                  {
                    id: cuid(),
                    name: chartItem.title || '',
                    inputVisible: false,
                    queryModel: { query: res.data.query_text },
                  },
                ],
                chartItem,
              );
            })
            .catch(err => {
              notifyError(err);
            });
        }
        break;
      case 'join':
      case 'to-list':
      case 'to-percentages':
      case 'format-dates':
      case 'index':
        const sources = (dataset as AbstractParentSource).sources;
        if (sources) buildSerieQueryTree(sources, dataset.type.toLowerCase() as SourceType);
        break;
      case 'activities_analytics':
      case 'collection_volumes':
      case 'resources_usage':
      case 'data_ingestion':
        this.setNewSerieQueries(
          [
            {
              id: cuid(),
              name: chartItem.title || '',
              inputVisible: false,
              queryModel: (dataset as AnalyticsSource<AnalyticsMetric, AnalyticsDimension>)
                .query_json,
              type: dataset.type as QueryModelType,
            },
          ],
          chartItem,
        );
        break;
      default:
        break;
    }
  };

  onQueryParamsChange = (eg: boolean, c: boolean, p: QueryPrecisionMode) => {
    const { tabs, activeKey } = this.state;
    const newTabs = tabs.map(tab => {
      if (activeKey === tab.key) {
        return {
          ...tab,
          evaluateGraphQl: eg,
          useCache: c,
          precision: p,
        };
      } else return tab;
    });

    this.setState({
      tabs: newTabs,
    });
  };

  pushEventTabs = (tabKey: string) => {
    if (tabKey === 'charts') {
      this._tagService.pushEvent('ChartsListLoading', 'Query tool');
    }
  };

  handleShareButtonClick = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    message.info(formatMessage(messages.chartShared));
  };

  getCurrentChartUrl = (chartId: string) => {
    const { location } = this.props;
    return `${window.location.host}/#${location.pathname}?chartId=${chartId}`;
  };

  clearAllSavedQueries = () => {
    localStorage.removeItem('savedQueries');
    this.initTabState();
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
      intl,
      editionMode,
      createdQueryId,
      hasFeature,
      renderActionBar,
      renderSaveAsButton,
      query,
      queryExecutionSource,
      queryExecutionSubSource,
    } = this.props;
    const { schemaLoading, activeKey, tabs, noLiveSchemaFound, rawSchema, chartsSearchPanelKey } =
      this.state;

    const currentTab = tabs.length > 0 ? tabs.find(t => t.key === activeKey) : undefined;

    const serieQueryToUse = currentTab?.serieQueries[0];

    let startType = 'UserPoint';

    if (
      rawSchema &&
      serieQueryToUse &&
      serieQueryToUse.type === 'otql' &&
      currentTab &&
      currentTab.serieQueries.length < 2
    ) {
      const foundType = rawSchema.find(ot => {
        const matchResult = (serieQueryToUse.queryModel as OTQLQueryModel).query.match(
          /FROM(?:\W*)(\w+)/i,
        );
        if (!matchResult || matchResult.length === 0) return false;
        return matchResult[1] === ot.name;
      });
      if (foundType) {
        startType = foundType.name;
      }
    }

    const saveExtraOptions = (
      <Row>
        <Button className='mcs-otqlInputEditor_save_as_button' onClick={this.clearAllSavedQueries}>
          {intl.formatMessage(messages.clearTabs)}
        </Button>
        {currentTab?.chartItem && (
          <CopyToClipboard
            onCopy={this.handleShareButtonClick}
            text={this.getCurrentChartUrl(currentTab.chartItem.id)}
          >
            <Button className='mcs-otqlInputEditor_save_as_button'>
              {intl.formatMessage(messages.shareButton)}
            </Button>
          </CopyToClipboard>
        )}
        {currentTab &&
          currentTab.serieQueries.length === 1 &&
          serieQueryToUse?.type === 'otql' &&
          renderSaveAsButton &&
          renderSaveAsButton((serieQueryToUse.queryModel as OTQLQueryModel).query, datamartId)}
      </Row>
    );

    return (
      <Layout>
        {renderActionBar &&
          serieQueryToUse?.type === 'otql' &&
          renderActionBar((serieQueryToUse.queryModel as OTQLQueryModel).query, datamartId)}
        <Layout>
          <QueryToolTabContext.Provider value={{ queryExecutionSource, queryExecutionSubSource }}>
            <Content className='mcs-content-container'>
              {schemaLoading ? (
                <Loading isFullScreen={false} className={'mcs-otqlConsoleContainer_loader'} />
              ) : (
                <Tabs
                  className={'mcs-OTQLConsoleContainer_tabs'}
                  type='editable-card'
                  onChange={this.onChange}
                  activeKey={activeKey}
                  onEdit={this.onEdit}
                  tabBarExtraContent={saveExtraOptions}
                  hideAdd={editionMode}
                >
                  {editionMode && tabs[0] ? (
                    <TabPane
                      className={'mcs-OTQLConsoleContainer_tabs_tab'}
                      tab={intl.formatMessage(messages.queryToSave)}
                      key={1}
                      closable={false}
                    >
                      <div className={'mcs-OTQLConsoleContainer_tab_content'}>
                        <QueryToolTab
                          datamartId={this.props.datamartId}
                          query={
                            editionMode && query?.includes('where')
                              ? query
                              : this.getStringFirstQuery()
                          }
                          editionMode={editionMode}
                          tab={tabs[0]}
                          runQuery={this.runQuery}
                          onInputChange={this.onInputChange}
                          updateNameModel={this.updateNameModel}
                          updateQueryModel={this.updateQueryModel}
                          displaySerieInput={this.displaySerieInput}
                          onSeriesChange={this.onSeriesChange}
                          noLiveSchemaFound={noLiveSchemaFound}
                          rawSchema={rawSchema}
                          dismissError={this.dismissError}
                          abortQuery={this.abortQuery}
                          onDeleteChart={this.onDeleteChart}
                          onQueryParamsChange={this.onQueryParamsChange}
                        />

                        {this.renderSchemaVisualizer(startType)}
                      </div>
                    </TabPane>
                  ) : (
                    tabs.map((tab, i) => (
                      <TabPane
                        className={'mcs-OTQLConsoleContainer_tabs_tab'}
                        tab={
                          i === 0 && editionMode
                            ? intl.formatMessage(messages.queryToSave)
                            : tab.title
                        }
                        key={tab.key}
                        closable={tab.closable}
                      >
                        {createdQueryId && (
                          <Alert
                            className={'mcs-OTQLConsoleContainer_tabs_createdQueryMessage'}
                            message={`Query ${createdQueryId} created.`}
                            type='success'
                            closable={true}
                            showIcon={true}
                          />
                        )}
                        <div className={'mcs-OTQLConsoleContainer_tab_content'}>
                          <QueryToolTab
                            datamartId={this.props.datamartId}
                            query={
                              editionMode && query?.includes('where')
                                ? query
                                : this.getStringFirstQuery()
                            }
                            editionMode={editionMode}
                            tab={tab}
                            runQuery={this.runQuery}
                            onInputChange={this.onInputChange}
                            updateNameModel={this.updateNameModel}
                            updateQueryModel={this.updateQueryModel}
                            displaySerieInput={this.displaySerieInput}
                            onSeriesChange={this.onSeriesChange}
                            noLiveSchemaFound={noLiveSchemaFound}
                            rawSchema={rawSchema}
                            dismissError={this.dismissError}
                            abortQuery={this.abortQuery}
                            onSaveChart={this.onSaveChart}
                            onDeleteChart={this.onDeleteChart}
                            onQueryParamsChange={this.onQueryParamsChange}
                          />

                          {hasFeature('datastudio-query_tool-charts_loader') && (
                            <Tabs
                              key={0}
                              type='line'
                              className='mcs-OTQLConsoleContainer_right-tab'
                              onTabClick={this.pushEventTabs}
                            >
                              <Tabs.TabPane tab='Schema' key='schema'>
                                {this.renderSchemaVisualizer(startType)}
                              </Tabs.TabPane>
                              <Tabs.TabPane
                                tab='Charts'
                                key='charts'
                                style={{ paddingLeft: '10px' }}
                              >
                                <ChartsSearchPanel
                                  key={chartsSearchPanelKey}
                                  organisationId={organisationId}
                                  onItemClick={this.launchQuery}
                                  chartItem={tab.chartItem}
                                />
                              </Tabs.TabPane>
                            </Tabs>
                          )}
                          {!hasFeature('datastudio-query_tool-charts_loader') &&
                            this.renderSchemaVisualizer(startType)}
                        </div>
                      </TabPane>
                    ))
                  )}
                </Tabs>
              )}
            </Content>
          </QueryToolTabContext.Provider>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, QueryToolTabsContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
)(QueryToolTabsContainer);
