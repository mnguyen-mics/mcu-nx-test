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

const messages = defineMessages({
  queryToSave: {
    id: 'queryTool.OtqlConsole.tab.queryToSave',
    defaultMessage: 'Query to save',
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
  queryResult: OTQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
  schemaVizOpen: boolean;
  schemaLoading: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  noLiveSchemaFound: boolean;
  panes: McsTabsItem[];
  activeKey: string;
  showChartLegend?: boolean;
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
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      schemaVizOpen: true,
      schemaLoading: false,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
      activeKey: '1',
      panes: [],
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.add();
    this.fetchObjectTypes(datamartId);
  }

  componentDidUpdate(prevProps: Props) {
    const { datamartId } = this.props;
    const { datamartId: prevDatamartId } = prevProps;
    if (prevDatamartId !== datamartId) {
      this.setState(
        {
          panes: [],
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
    this.setState({ schemaLoading: true, noLiveSchemaFound: false, error: null });
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
          error: err,
          schemaLoading: false,
        });
      });
  };

  runQuery = () => {
    const { datamartId } = this.props;
    const { precision, useCache, evaluateGraphQl, activeKey, panes } = this.state;
    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
    });
    const serieQueries = panes.find(tab => tab.key === activeKey)?.serieQueries;
    if (
      serieQueries &&
      serieQueries.length === 1 &&
      typeof serieQueries[0].queryModel === 'string'
    ) {
      const otqlQuery = serieQueries[0].queryModel;
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
            runningQuery: false,
            queryResult: result.data,
            showChartLegend: !(
              result?.data?.rows && hasSubBucketsOrMultipleSeries(result.data.rows)
            ),
            panes: panes.map(tab => {
              if (tab.key === activeKey) {
                return {
                  ...tab,
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
            error: !error.isCanceled ? error : null,
            runningQuery: false,
          });
        });
    } else {
      const tabQuery = panes.find(tab => tab.key === activeKey);
      if (tabQuery) {
        this.fetchQuerySeriesDataset(tabQuery.serieQueries);
      }
    }
  };

  updateQueryModel = (serieId: string, queryId?: string) => (query: string) => {
    const { activeKey, panes } = this.state;
    const { editionMode } = this.props;
    if (editionMode) {
      this.setState({
        panes: panes.map(tab => {
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
        panes: panes.map(tab => {
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
    const { activeKey, panes } = this.state;
    this.setState({
      panes: panes.map(tab => {
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
    const { activeKey, panes } = this.state;
    this.setState({
      panes: panes.map(tab => {
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
    const { activeKey, panes } = this.state;

    this.setState({
      panes: panes.map(tab => {
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
          runningQuery: false,
          queryResult: response,
          showChartLegend: response.dataset?.length < 2,
        });
      })
      .catch(error => {
        // tslint:disable-next-line:no-console
        console.log(error);

        this.setState({
          error: !error.isCanceled ? error : null,
          runningQuery: false,
        });
      });
  };

  abortQuery = () => {
    this.asyncQuery.cancel();
    this.setState({ queryAborted: true, runningQuery: false });
  };

  dismissError = () => this.setState({ error: null });

  onSeriesChanged = (newSeries: SerieQueryModel[]) => {
    const { panes, activeKey } = this.state;
    this.setState({
      panes: panes?.map(tab => {
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
    const { panes, activeKey } = this.state;
    let newActiveKey = activeKey;
    let lastIndex;

    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = panes.filter(pane => pane.key !== targetKey);

    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex && lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    if (newPanes.length === 1) {
      newPanes[0].closable = false;
    }

    this.setState({
      panes: newPanes,
      activeKey: newActiveKey,
    });
  };

  add = () => {
    const { panes } = this.state;

    if (panes.length === 1) {
      panes[0].closable = true;
    }

    const newPanes = [...panes];
    const newKey = newPanes.length > 0 ? parseInt(newPanes[newPanes.length - 1].key, 10) + 1 : 1;
    const activeKey = newKey.toString();
    newPanes.push({
      title: `Query ${newKey}`,
      key: activeKey,
      closable: !!(this.state.panes.length > 0),
      serieQueries: this.getDefaultSerieQuery(),
    });
    this.setState({
      panes: newPanes,
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
    const { panes } = this.state;
    const firstTabQuery = panes.find(t => t.key === '1');
    const queryToUse =
      firstTabQuery && !isQueryListModel(firstTabQuery.serieQueries[0].queryModel)
        ? firstTabQuery.serieQueries[0].queryModel
        : DEFAULT_OTQL_QUERY;
    return queryToUse;
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
    const {
      schemaLoading,
      activeKey,
      panes,
      error,
      queryAborted,
      queryResult,
      runningQuery,
      precision,
      useCache,
      noLiveSchemaFound,
      showChartLegend,
      evaluateGraphQl,
      rawSchema,
    } = this.state;

    const queryToUse = this.getStringFirstQuery();

    const currentTab = panes.length > 0 ? panes.find(p => p.key === activeKey) : undefined;

    let startType = 'UserPoint';

    if (rawSchema) {
      const foundType = rawSchema.find(ot => {
        const matchResult = queryToUse.match(/FROM(?:\W*)(\w+)/i);
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
                {panes.map((pane, i) => (
                  <TabPane
                    className={'mcs-OTQLConsoleContainer_tabs_tab'}
                    tab={
                      i === 0 && editionMode ? intl.formatMessage(messages.queryToSave) : pane.title
                    }
                    key={pane.key}
                    closable={pane.closable}
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
                        serieQueries={pane.serieQueries}
                        runQuery={this.runQuery}
                        onInputChange={this.onInputChange}
                        updateNameModel={this.updateNameModel}
                        updateQueryModel={this.updateQueryModel}
                        displaySerieInput={this.displaySerieInput}
                        onSeriesChanged={this.onSeriesChanged}
                        showChartLegend={showChartLegend}
                        error={error}
                        queryAborted={queryAborted}
                        queryResult={queryResult}
                        precision={precision}
                        runningQuery={runningQuery}
                        useCache={useCache}
                        noLiveSchemaFound={noLiveSchemaFound}
                        evaluateGraphQl={evaluateGraphQl}
                        rawSchema={rawSchema}
                        dismissError={this.dismissError}
                        abortQuery={this.abortQuery}
                      />

                      {hasFeature('datastudio-query_tool-charts_loader') && (
                        <Tabs key={0} type='line' className='mcs-OTQLConsoleContainer_right-tab'>
                          <Tabs.TabPane tab='Schema' key={1}>
                            {this.renderSchemaVisualizer(startType)}
                          </Tabs.TabPane>
                          <Tabs.TabPane tab='Charts' key={2}>
                            <ChartsSearchPanel organisationId={organisationId} />
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
