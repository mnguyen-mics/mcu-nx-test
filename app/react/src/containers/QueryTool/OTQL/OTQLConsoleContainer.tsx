import * as React from 'react';
import { Alert, Layout, Row, Tabs } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import {
  hasSubBucketsOrMultipleSeries,
  isQueryListModel,
  isSerieQueryModel,
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
import OTQLRequest, { SerieQueryModel } from './OTQLRequest';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import ChartsSearchPanel from '../ChartsSearchPanel';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery } from './utils/QueryUtils';
import { getChartDataset } from './utils/ChartOptionsUtils';
import { IChartDatasetService } from '@mediarithmics-private/advanced-components';
import _ from 'lodash';
import cuid from 'cuid';

const messages = defineMessages({
  queryToSave: {
    id: 'queryTool.OtqlConsole.tab.queryToSave',
    defaultMessage: 'Query to save',
  },
  chartSaved: {
    id: 'queryTool.OtqlConsole.tab.chartSaved',
    defaultMessage: 'Chart is saved',
  },
});

const { Content } = Layout;
const { TabPane } = Tabs;

interface McsTabsItem {
  className?: string;
  title: React.ReactChild;
  display?: JSX.Element;
  key: string;
  closable: boolean;
  serieQueries: SerieQueryModel[];
  runningQuery: boolean;
  queryResult: OTQLResult | null;
  queryAborted: boolean;
  error?: any;
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  showChartLegend?: boolean;
}

export interface OTQLConsoleContainerProps {
  datamartId: string;
  renderActionBar?: (query: string, datamartId: string) => React.ReactNode;
  query?: string;
  queryEditorClassName?: string;
  editionMode?: boolean;
  createdQueryId?: string;
  renderSaveAsButton?: (query: string, datamartId: string) => React.ReactNode;
}

interface State {
  schemaVizOpen: boolean;
  schemaLoading: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  noLiveSchemaFound: boolean;
  tabs: McsTabsItem[];
  activeKey: string;
  chartsSearchPanelKey: string;
}

type Props = OTQLConsoleContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class OTQLConsoleContainer extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IChartDatasetService)
  private _chartDatasetService: IChartDatasetService;

  constructor(props: Props) {
    super(props);
    this.state = {
      schemaVizOpen: true,
      schemaLoading: false,
      noLiveSchemaFound: false,
      activeKey: '1',
      tabs: [],
      chartsSearchPanelKey: cuid(),
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.fetchObjectTypes(datamartId).then(() => {
      this.add();
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { datamartId } = this.props;
    const { datamartId: prevDatamartId } = prevProps;
    if (prevDatamartId !== datamartId) {
      this.setState(
        {
          tabs: [],
        },
        () => {
          this.add();
        },
      );
      this.fetchObjectTypes(datamartId);
    }
  }

  getDefaultSerieQuery = () => {
    return [getNewSerieQuery('Series 1', this.getInitialQuery())];
  };

  getInitialQuery = (): string => {
    const { editionMode, query } = this.props;
    return editionMode && query ? query : DEFAULT_OTQL_QUERY;
  };

  fetchObjectTypes = (datamartId: string) => {
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
    const { datamartId } = this.props;
    const { activeKey, tabs } = this.state;
    const activeTab = tabs.find(tab => tab.key === activeKey);
    this.setState({
      tabs: tabs.map(t => {
        if (t.key === activeKey) {
          return {
            ...t,
            runningQuery: true,
            error: null,
            queryAborted: false,
          };
        } else return t;
      }),
    });
    const serieQueries = activeTab?.serieQueries;
    if (
      serieQueries &&
      serieQueries.length === 1 &&
      typeof serieQueries[0].queryModel === 'string'
    ) {
      const otqlQuery = serieQueries[0].queryModel;
      const precision = activeTab?.precision;
      const useCache = activeTab?.useCache;
      const evaluateGraphQl = activeTab?.evaluateGraphQl;
      this.asyncQuery = makeCancelable(
        this._queryService.runOTQLQuery(datamartId, otqlQuery, {
          precision: precision,
          use_cache: useCache,
          graphql_select: evaluateGraphQl,
        }),
      );
      this.asyncQuery.promise
        .then(result => {
          this.setState({
            tabs: tabs.map(tab => {
              if (tab.key === activeKey) {
                return {
                  ...tab,
                  runningQuery: false,
                  queryResult: result.data,
                  showChartLegend: !(
                    result?.data?.rows && hasSubBucketsOrMultipleSeries(result.data.rows)
                  ),
                  serieQueries: serieQueries.map((q, i) =>
                    i === 0
                      ? {
                          ...q,
                          query: otqlQuery,
                          queryModel: otqlQuery,
                        }
                      : q,
                  ),
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
    } else {
      const tabQuery = tabs.find(tab => tab.key === activeKey);
      if (tabQuery) {
        this.fetchQuerySeriesDataset(tabQuery.serieQueries);
      }
    }
  };

  updateQueryModel = (serieId: string, queryId?: string) => (query: string) => {
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
                if (isQueryListModel(serieQueryModel) && queryId) {
                  return {
                    ...serie,
                    queryModel: serieQueryModel.map(model => {
                      if (model.id === queryId) {
                        return {
                          ...model,
                          query,
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
    queryId?: string,
  ) => {
    return serieQueries.map(serie => {
      const serieQueryModel = serie.queryModel;
      if (isQueryListModel(serieQueryModel) && queryId) {
        return {
          ...serie,
          queryModel: serieQueryModel.map(model => {
            if (model.id === queryId) {
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

  updateNameModel = (serieId: string, queryId?: string) => (event: any) => {
    const { activeKey, tabs } = this.state;
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: this.updateTree(serieId, event, false, tab.serieQueries, queryId),
          };
        } else return tab;
      }),
    });
  };

  onInputChange = (serieId: string, queryId?: string) => (event: any) => {
    const { activeKey, tabs } = this.state;
    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: this.updateTree(serieId, event, true, tab.serieQueries, queryId),
          };
        } else return tab;
      }),
    });
  };

  displaySerieInput = (serieId: string, queryId?: string) => (e: any) => {
    const { activeKey, tabs } = this.state;

    this.setState({
      tabs: tabs.map(tab => {
        if (tab.key === activeKey) {
          return {
            ...tab,
            serieQueries: tab.serieQueries.map(serie => {
              const serieQueryModel = serie.queryModel;
              if (isQueryListModel(serieQueryModel) && queryId) {
                return {
                  ...serie,
                  queryModel: serieQueryModel.map(model => {
                    if (model.id === queryId) {
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

  fetchQuerySeriesDataset = (serieQueries: SerieQueryModel[]) => {
    const {
      datamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { tabs, activeKey } = this.state;
    // TODO: improve typing of fetchDataset
    // in ADV library
    const getSources = () => {
      return serieQueries.map(serieQuery => {
        if (isSerieQueryModel(serieQuery)) {
          if (typeof serieQuery.queryModel === 'string') {
            return getChartDataset(
              'table',
              {
                query_text: serieQuery.queryModel,
                type: 'otql',
                series_title: serieQuery.name,
              } as any,
              true,
              {},
            );
          } else {
            return {
              type: 'to-list',
              sources: serieQuery.queryModel.map(queryListModel => {
                return getChartDataset(
                  'table',
                  {
                    query_text: queryListModel.query,
                    type: 'otql',
                    series_title: queryListModel.name,
                  } as any,
                  true,
                  {},
                );
              }),
            };
          }
        }
      });
    };
    return this._chartDatasetService
      .fetchDataset(datamartId, organisationId, {
        title: '',
        type: 'table',
        dataset: {
          type: 'join',
          sources: getSources(),
        } as any,
      })
      .then(res => {
        const response = res as any;
        this.setState({
          tabs: tabs.map(tab => {
            if (tab.key === activeKey) {
              return {
                ...tab,
                runningQuery: false,
                queryResult: response,
                showChartLegend: response.dataset?.length < 2,
              };
            } else return tab;
          }),
        });
      })
      .catch(error => {
        // tslint:disable-next-line:no-console
        console.log(error);
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
    this.asyncQuery.cancel();
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

  onSeriesChanged = (newSeries: SerieQueryModel[]) => {
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
    // @ts-expect-error
    this[action](targetKey);
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

  add = () => {
    const { tabs } = this.state;

    if (tabs.length === 1) {
      tabs[0].closable = true;
    }

    const newTabs = [...tabs];
    const newKey = newTabs.length > 0 ? parseInt(newTabs[newTabs.length - 1].key, 10) + 1 : 1;
    const activeKey = newKey.toString();
    newTabs.push({
      title: `Query ${newKey}`,
      key: activeKey,
      closable: !!(this.state.tabs.length > 0),
      serieQueries: this.getDefaultSerieQuery(),
      runningQuery: false,
      queryAborted: false,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      queryResult: null,
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
      firstTabQuery && !isQueryListModel(firstTabQuery.serieQueries[0]?.queryModel)
        ? firstTabQuery.serieQueries[0]?.queryModel
        : DEFAULT_OTQL_QUERY;
    return queryToUse;
  };

  onSaveChart = () => {
    const { intl } = this.props;
    this.props.notifySuccess({
      message: intl.formatMessage(messages.chartSaved),
      description: '',
    });

    this.setState({
      chartsSearchPanelKey: cuid(),
    });
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
    } = this.props;
    const { schemaLoading, activeKey, tabs, noLiveSchemaFound, rawSchema, chartsSearchPanelKey } =
      this.state;

    const queryToUse = this.getStringFirstQuery();

    const currentTab = tabs.length > 0 ? tabs.find(t => t.key === activeKey) : undefined;

    let startType = 'UserPoint';

    if (rawSchema) {
      const foundType = rawSchema.find(ot => {
        const matchResult = queryToUse?.match(/FROM(?:\W*)(\w+)/i);
        if (!matchResult || matchResult.length === 0) return false;
        return matchResult[1] === ot.name;
      });
      if (foundType) {
        startType = foundType.name;
      }
    }

    const saveExtraOptions = (
      <Row>
        {currentTab &&
          currentTab.serieQueries.length === 1 &&
          !isQueryListModel(currentTab.serieQueries[0].queryModel) &&
          renderSaveAsButton &&
          renderSaveAsButton(queryToUse, datamartId)}
      </Row>
    );

    return (
      <Layout>
        {renderActionBar && renderActionBar(queryToUse, datamartId)}
        <Layout>
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
              >
                {tabs.map((tab, i) => (
                  <TabPane
                    className={'mcs-OTQLConsoleContainer_tabs_tab'}
                    tab={
                      i === 0 && editionMode ? intl.formatMessage(messages.queryToSave) : tab.title
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
                      <OTQLRequest
                        datamartId={this.props.datamartId}
                        query={
                          editionMode && query?.includes('where')
                            ? query
                            : this.getStringFirstQuery()
                        }
                        editionMode={editionMode}
                        serieQueries={tab.serieQueries}
                        runQuery={this.runQuery}
                        onInputChange={this.onInputChange}
                        updateNameModel={this.updateNameModel}
                        updateQueryModel={this.updateQueryModel}
                        displaySerieInput={this.displaySerieInput}
                        onSeriesChanged={this.onSeriesChanged}
                        showChartLegend={tab.showChartLegend}
                        error={tab.error}
                        queryAborted={tab.queryAborted}
                        queryResult={tab.queryResult}
                        precision={tab.precision}
                        runningQuery={tab.runningQuery}
                        useCache={tab.useCache}
                        noLiveSchemaFound={noLiveSchemaFound}
                        evaluateGraphQl={tab.evaluateGraphQl}
                        rawSchema={rawSchema}
                        dismissError={this.dismissError}
                        abortQuery={this.abortQuery}
                        onSaveChart={this.onSaveChart}
                      />

                      {hasFeature('datastudio-query_tool-charts_loader') && (
                        <Tabs key={0} type='line' className='mcs-OTQLConsoleContainer_right-tab'>
                          <Tabs.TabPane tab='Schema' key={1}>
                            {this.renderSchemaVisualizer(startType)}
                          </Tabs.TabPane>
                          <Tabs.TabPane tab='Charts' key={2}>
                            <ChartsSearchPanel
                              key={chartsSearchPanelKey}
                              organisationId={organisationId}
                            />
                          </Tabs.TabPane>
                        </Tabs>
                      )}
                      {!hasFeature('datastudio-query_tool-charts_loader') &&
                        this.renderSchemaVisualizer(startType)}
                    </div>
                  </TabPane>
                ))}
              </Tabs>
            )}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, OTQLConsoleContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
)(OTQLConsoleContainer);
