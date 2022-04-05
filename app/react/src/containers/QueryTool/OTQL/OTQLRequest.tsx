import * as React from 'react';
import { Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import {
  hasSubBucketsOrMultipleSeries,
  OTQLResult,
  isCountResult,
  QueryPrecisionMode,
  isAggregateDataset,
} from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLInputEditor from './OTQLInputEditor';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { lazyInject } from '../../../config/inversify.config';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import cuid from 'cuid';
import { IChartDatasetService } from '@mediarithmics-private/advanced-components';
import { getChartDataset } from './utils/ChartOptionsUtils';
import { TYPES } from '../../../constants/types';
import { AggregateDataset } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';

export interface OTQLRequestProps {
  datamartId: string;
  query?: string;
  queryEditorClassName?: string;
  setQuery?: (query: string) => void;
}

export interface SerieQueryModel {
  id: string;
  serieName: string;
  inputVisible?: boolean;
  query: string;
}

const getNewSerieQuery = (index: number, defaultValue?: string): SerieQueryModel => {
  return {
    id: cuid(),
    query: defaultValue || '',
    serieName: `Serie ${index}`,
  };
};

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
      query: this.getDefaultQuery(),
      serieQueries: [getNewSerieQuery(1, this.getDefaultQuery())],
      schemaVizOpen: true,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
    };
  }

  getDefaultQuery = () => {
    const { query } = this.props;
    return query || 'SELECT @count{} FROM UserPoint';
  };

  runQuery = (otqlQuery: string) => {
    const { datamartId } = this.props;
    const { precision, useCache, evaluateGraphQl, serieQueries } = this.state;
    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
      queryResult: null,
    });
    if (this.isQuerySeriesActivated()) {
      this.fetchQuerySeriesDataset();
    } else {
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
    }
  };

  fetchQuerySeriesDataset = () => {
    const {
      datamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { serieQueries } = this.state;
    // TODO: improve typing of fetchDataset
    // in ADV library
    return this._chartDatasetService
      .fetchDataset(datamartId, organisationId, {
        title: '',
        type: 'table',
        dataset: {
          sources: serieQueries.map(serieQuery => {
            return getChartDataset(
              'table',
              {
                query_text: serieQuery.query,
                type: 'otql',
                series_title: serieQuery.serieName,
              } as any,
              true,
              {},
            );
          }),
          type: 'join',
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

  updateQueryModel = (id: string) => (query: string) => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.map(queryModel => {
        if (queryModel.id === id) {
          return {
            ...queryModel,
            query,
          };
        }
        return queryModel;
      }),
    });
  };

  updateNameModel = (id: string) => (event: any) => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.map(queryModel => {
        if (queryModel.id === id) {
          return {
            ...queryModel,
            inputVisible: false,
            serieName: event.target.value,
          };
        }
        return queryModel;
      }),
    });
  };

  onInputChange = (id: string) => (e: any) => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.map(queryModel => {
        if (queryModel.id === id) {
          return {
            ...queryModel,
            serieName: e.target.value,
          };
        }
        return queryModel;
      }),
    });
  };

  displaySerieInput = (id: string) => (e: any) => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.map(queryModel => {
        if (queryModel.id === id) {
          return {
            ...queryModel,
            inputVisible: !queryModel.inputVisible,
          };
        }
        return queryModel;
      }),
    });
  };

  addNewSerie = (index: number) => () => {
    this.setState({
      serieQueries: this.state.serieQueries.concat(getNewSerieQuery(index, this.getDefaultQuery())),
    });
  };

  deleteSerie = (id: string) => () => {
    const { serieQueries } = this.state;
    this.setState({
      serieQueries: serieQueries.filter(queryModel => queryModel.id !== id),
    });
  };

  isQuerySeriesActivated = () => {
    const { queryResult } = this.state;
    return (
      !!queryResult && (isAggregateDataset(queryResult) ? true : !isCountResult(queryResult.rows))
    );
  };

  render() {
    const { intl, datamartId, queryEditorClassName, hasFeature } = this.props;
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

    const onChange = (q: string) => {
      if (this.props.setQuery) {
        this.props.setQuery(q);
      }

      this.setState({ query: q });
    };

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
          onQueryChange={onChange}
          defaultValue={query}
          handleChange={handleChange}
          precision={precision}
          evaluateGraphQl={evaluateGraphQl}
          useCache={useCache}
          queryEditorClassName={queryEditorClassName}
          isQuerySeriesActivated={this.isQuerySeriesActivated()}
          serieQueries={serieQueries}
          onInputChange={this.onInputChange}
          updateQueryModel={this.updateQueryModel}
          updateNameModel={this.updateNameModel}
          displaySerieInput={this.displaySerieInput}
          addNewSerie={this.addNewSerie}
          deleteSerie={this.deleteSerie}
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
