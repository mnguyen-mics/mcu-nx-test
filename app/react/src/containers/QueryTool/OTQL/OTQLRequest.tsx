import * as React from 'react';
import { Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { OTQLResult, QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLInputEditor from './OTQLInputEditor';
import { DataResponse } from '../../../services/ApiService';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';

export interface OTQLRequestProps {
  datamartId: string;
  query?: string;
  queryEditorClassName?: string;
  setQuery?: (query: string) => void;
}

interface State {
  queryResult: OTQLResult | null;
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
}

type Props = OTQLRequestProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class OTQLRequest extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      query: props.query || 'SELECT @count{} FROM UserPoint',
      schemaVizOpen: true,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
    };
  }

  runQuery = (otqlQuery: string) => {
    const { datamartId } = this.props;
    const { precision, useCache, evaluateGraphQl } = this.state;
    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
      queryResult: null,
    });
    this.asyncQuery = makeCancelable(
      this._queryService.runOTQLQuery(datamartId, otqlQuery, {
        precision: precision,
        use_cache: useCache,
        graphql_select: evaluateGraphQl,
      }),
    );
    this.asyncQuery.promise
      .then(result => {
        this.setState({ runningQuery: false, queryResult: result.data });
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
