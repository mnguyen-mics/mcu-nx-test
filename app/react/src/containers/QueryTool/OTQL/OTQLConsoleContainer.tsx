import * as React from 'react';
import { Layout, Alert } from 'antd';
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
import SchemaVizualizer from '../JSONOTQL/SchemaVisualizer/SchemaVizualizer';
import { computeFinalSchemaItem } from '../JSONOTQL/domain';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { Loading } from '../../../components';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';

const { Content, Sider } = Layout;

export interface OTQLConsoleContainerProps {
  datamartId: string;
  renderActionBar: (query: string, datamartId: string) => React.ReactNode;
  query?: string;
  queryEditorClassName?: string;
}

interface State {
  queryResult: OTQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
  query: string;
  schemaVizOpen: boolean;
  schemaLoading: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  noLiveSchemaFound: boolean;
}

type Props = OTQLConsoleContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class OTQLConsoleContainer extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<OTQLResult>>;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      query: props.query || 'SELECT @count{} FROM UserPoint',
      schemaVizOpen: true,
      schemaLoading: true,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.fetchObjectTypes(datamartId);
  }

  componentDidUpdate(prevProps: Props) {
    const { datamartId } = this.props;
    const { datamartId: prevDatamartId } = prevProps;
    if (prevDatamartId !== datamartId) {
      this.fetchObjectTypes(datamartId);
    }
  }

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
    const { intl, datamartId, queryEditorClassName } = this.props;
    const {
      error,
      queryResult,
      runningQuery,
      queryAborted,
      schemaVizOpen,
      schemaLoading,
      rawSchema,
      query,
      precision,
      evaluateGraphQl,
      useCache,
      noLiveSchemaFound,
    } = this.state;

    if (schemaLoading) {
      return <Loading isFullScreen={true} />;
    }

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
      <OTQLResultRenderer loading={runningQuery} result={queryResult} aborted={queryAborted} />
    );

    const onChange = (q: string) => this.setState({ query: q });

    let startType = 'UserPoint';

    if (rawSchema) {
      const foundType = rawSchema.find(ot => {
        return !!query.includes(ot.name);
      });
      if (foundType) {
        startType = foundType.name;
      }
    }

    const handleChange = (eg: boolean, c: boolean, p: QueryPrecisionMode) =>
      this.setState({ evaluateGraphQl: eg, useCache: c, precision: p });

    return (
      <Layout>
        {this.props.renderActionBar(this.state.query, datamartId)}
        <Layout>
          <Layout>
            <Content className='mcs-content-container'>
              <ContentHeader
                title={
                  <FormattedMessage
                    id='queryTool.query-tool-page-title'
                    defaultMessage='Query Tool'
                  />
                }
              />
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
            </Content>
          </Layout>
          <Sider width={schemaVizOpen ? 250 : 0}>
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
          </Sider>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, OTQLConsoleContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(OTQLConsoleContainer);

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
