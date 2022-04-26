import * as React from 'react';
import { Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { CancelablePromise, makeCancelable } from '../../../utils/ApiHelper';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import {
  OTQLResult,
  QueryPrecisionMode,
  hasSubBucketsOrMultipleSeries,
  isQueryListModel,
  isSerieQueryModel,
} from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLInputEditor from './OTQLInputEditor';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { lazyInject } from '../../../config/inversify.config';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { IChartDatasetService } from '@mediarithmics-private/advanced-components';
import { getChartDataset } from './utils/ChartOptionsUtils';
import { TYPES } from '../../../constants/types';
import { AggregateDataset } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery } from './utils/QueryUtils';
import { IQueryService } from '../../../services/QueryService';

export interface OTQLRequestProps {
  datamartId: string;
  query?: string;
  queryEditorClassName?: string;
  setQuery?: (query: string) => void;
  editionMode?: boolean;
}

interface AbstractSerieQueryModel {
  id: string;
  name: string;
  inputVisible?: boolean;
}

export interface QueryListModel extends AbstractSerieQueryModel {
  query: string;
}
export interface SerieQueryModel extends AbstractSerieQueryModel {
  queryModel: string | QueryListModel[];
}

interface State {
  queryResult: OTQLResult | AggregateDataset | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
  query: string;
  schemaVizOpen: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  noLiveSchemaFound: boolean;
  serieQueries: SerieQueryModel[];
  showChartLegend?: boolean;
}

type Props = OTQLRequestProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class OTQLRequest extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  @lazyInject(TYPES.IChartDatasetService)
  private _chartDatasetService: IChartDatasetService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);

    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      query: DEFAULT_OTQL_QUERY,
      serieQueries: [getNewSerieQuery('Series 1', this.getInitialQuery())],
      schemaVizOpen: true,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
    };
  }

  getInitialQuery = (): string => {
    const { editionMode, query } = this.props;
    return editionMode && query ? query : DEFAULT_OTQL_QUERY;
  };

  runQuery = () => {
    const { datamartId } = this.props;
    const { precision, useCache, evaluateGraphQl, serieQueries } = this.state;
    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
    });
    if (serieQueries.length === 1 && typeof serieQueries[0].queryModel === 'string') {
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
            serieQueries: serieQueries.map((q, i) =>
              i === 0
                ? {
                    ...q,
                    query: otqlQuery,
                    queryModel: otqlQuery,
                  }
                : q,
            ),
          });
        })
        .catch(error => {
          this.setState({
            error: !error.isCanceled ? error : null,
            runningQuery: false,
          });
        });
    } else {
      this.fetchQuerySeriesDataset(serieQueries);
    }
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

  updateQueryModel = (serieId: string, queryId?: string) => (query: string) => {
    const { serieQueries } = this.state;
    const { editionMode, setQuery } = this.props;
    if (editionMode && setQuery) {
      setQuery(query);
      this.setState({
        serieQueries: [
          {
            id: '',
            name: '',
            queryModel: query,
          },
        ],
      });
    } else {
      this.setState({
        serieQueries: serieQueries.map(serie => {
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
      });
    }
  };

  updateTree = (serieId: string, event: any, inputVisible: boolean, queryId?: string) => {
    const { serieQueries } = this.state;
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
    this.setState({
      serieQueries: this.updateTree(serieId, event, false, queryId),
    });
  };

  onInputChange = (serieId: string, queryId?: string) => (event: any) => {
    this.setState({
      serieQueries: this.updateTree(serieId, event, true, queryId),
    });
  };

  displaySerieInput = (serieId: string, queryId?: string) => (e: any) => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.map(serie => {
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
    });
  };

  onSeriesChanged(newSeries: SerieQueryModel[]) {
    this.setState({
      serieQueries: newSeries,
    });
  }

  render() {
    const { intl, datamartId, queryEditorClassName, hasFeature, editionMode } = this.props;
    const {
      error,
      queryResult,
      runningQuery,
      queryAborted,
      query,
      precision,
      evaluateGraphQl,
      useCache,
      noLiveSchemaFound,
      showChartLegend,
      serieQueries,
    } = this.state;

    const errorMsg = error && (
      <Alert
        message='Error'
        style={{ marginBottom: 40 }}
        description={
          error.error_id ? (
            <span>
              {error.error}
              <br />
              <code>{error.error_id}</code>
            </span>
          ) : (
            intl.formatMessage(messages.queryErrorDefaultMsg)
          )
        }
        type='error'
        showIcon={true}
        closable={true}
        onClose={this.dismissError}
      />
    );

    const noLiveSchemaErrorMsg = noLiveSchemaFound && (
      <Alert
        message='Error'
        style={{ marginBottom: 40 }}
        description={intl.formatMessage(messages.noLiveSchemaFound)}
        type='error'
        showIcon={true}
      />
    );

    const queryResultRenderer: React.ReactNode = (runningQuery || queryAborted || queryResult) && (
      <OTQLResultRenderer
        loading={runningQuery}
        result={queryResult}
        aborted={queryAborted}
        query={query}
        datamartId={datamartId}
        showChartLegend={showChartLegend}
        serieQueries={serieQueries}
      />
    );

    const _onSeriesChanged = this.onSeriesChanged.bind(this);

    const handleChange = (eg: boolean, c: boolean, p: QueryPrecisionMode) =>
      this.setState({ evaluateGraphQl: eg, useCache: c, precision: p });

    return (
      <span className='mcs-otqlQuery_container'>
        {!hasFeature('query-tool-graphs') && (
          <ContentHeader
            title={
              <FormattedMessage
                id='queryTool.OTQL.query-tool-page-title'
                defaultMessage='Query Tool'
              />
            }
          />
        )}
        {errorMsg}
        {noLiveSchemaErrorMsg}
        <OTQLInputEditor
          onRunQuery={this.runQuery}
          onAbortQuery={this.abortQuery}
          runningQuery={runningQuery}
          datamartId={datamartId}
          handleChange={handleChange}
          precision={precision}
          evaluateGraphQl={evaluateGraphQl}
          useCache={useCache}
          queryEditorClassName={queryEditorClassName}
          isQuerySeriesActivated={true}
          serieQueries={serieQueries}
          onInputChange={this.onInputChange}
          updateQueryModel={this.updateQueryModel}
          updateNameModel={this.updateNameModel}
          displaySerieInput={this.displaySerieInput}
          onSeriesChanged={_onSeriesChanged}
          editionMode={editionMode}
        />
        {queryResultRenderer}
      </span>
    );
  }
}

export default compose<Props, OTQLRequestProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
)(OTQLRequest);

const messages = defineMessages({
  queryToolBreadcrumbLabel: {
    id: 'query-tool.action-bar.breadcrumb.label.query-tool',
    defaultMessage: 'Query Tool',
  },
  queryErrorDefaultMsg: {
    id: 'query-tool.error.default-message',
    defaultMessage: 'An error occured',
  },
  noLiveSchemaFound: {
    id: 'query-tool.error.no-live-schena',
    defaultMessage: "This datamart can't be queried as there is no LIVE schema associated to it",
  },
});
