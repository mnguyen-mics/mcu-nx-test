import * as React from 'react';
import { Layout, Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { GraphQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import GraphQLResultRenderer from './GraphQLResultRenderer';
import GraphQLInputEditor from './GraphQLInputEditor';
import { DataResponse } from '../../../services/ApiService';
import SchemaVizualizer from '../../Audience/AdvancedSegmentBuilder/SchemaVisualizer/SchemaVizualizer';
import { computeFinalSchemaItem } from '../../Audience/AdvancedSegmentBuilder/domain';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { Loading } from '../../../components';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';

const { Content, Sider } = Layout;

export interface GraphQLConsoleContainerProps {
  datamartId: string;
  renderActionBar: (query: string, datamartId: string) => React.ReactNode;
}

interface State {
  queryResult: GraphQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  error: any | null;
  query: string;
  schemaVizOpen: boolean;
  schemaLoading: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
}

type Props = GraphQLConsoleContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class GraphQLConsoleContainer extends React.Component<Props, State> {
  asyncQuery: CancelablePromise<DataResponse<GraphQLResult>>;

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
      query: 'query { fetchUserPoint(user_point_id:"") { creation_date } }',
      schemaVizOpen: true,
      schemaLoading: true,
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

  fetchObjectTypes = (datamartId: string): Promise<ObjectLikeTypeInfoResource[]> => {
    this.setState({ schemaLoading: true });
    return this._runtimeSchemaService.getRuntimeSchemas(datamartId).then(schemaRes => {
      const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
      if (!liveSchema) return [];
      return this._runtimeSchemaService
        .getObjectTypeInfoResources(datamartId, liveSchema.id)
        .then(r => {
          this.setState({ rawSchema: r, schemaLoading: false });
          return r;
        });
    });
  };

  runQuery = (otqlQuery: string) => {
    const { datamartId } = this.props;
    this.setState({
      runningQuery: true,
      error: null,
      queryAborted: false,
      queryResult: null,
    });
    this.asyncQuery = makeCancelable(this._queryService.runGraphQLQuery(datamartId, otqlQuery));
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
    const { intl, datamartId } = this.props;
    const {
      error,
      queryResult,
      runningQuery,
      queryAborted,
      schemaVizOpen,
      schemaLoading,
      rawSchema,
      query,
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

    const queryResultRenderer: React.ReactNode = (runningQuery || queryAborted || queryResult) && (
      <GraphQLResultRenderer loading={runningQuery} result={queryResult} aborted={queryAborted} />
    );

    const onChange = (q: string) => this.setState({ query: q });

    return (
      <Layout>
        {this.props.renderActionBar(this.state.query, datamartId)}
        <Layout>
          <Layout>
            <Content className='mcs-content-container'>
              <ContentHeader
                title={
                  <FormattedMessage
                    id='queryTool.graphQL.query-tool-page-title'
                    defaultMessage='Query Tool'
                  />
                }
              />
              {errorMsg}
              <GraphQLInputEditor
                onRunQuery={this.runQuery}
                onAbortQuery={this.abortQuery}
                runningQuery={runningQuery}
                datamartId={datamartId}
                onQueryChange={onChange}
                defaultValue={query}
              />
              {queryResultRenderer}
            </Content>
          </Layout>
          <Sider width={schemaVizOpen ? 250 : 0}>
            <div className='schema-visualizer'>
              <SchemaVizualizer
                schema={
                  rawSchema
                    ? computeFinalSchemaItem(rawSchema, 'UserPoint', false, false, false)
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

export default compose<Props, GraphQLConsoleContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(GraphQLConsoleContainer);

const messages = defineMessages({
  queryToolBreadcrumbLabel: {
    id: 'query-tool.action-bar.breadcrumb.label.query-tool.graphql',
    defaultMessage: 'Query Tool',
  },
  queryErrorDefaultMsg: {
    id: 'query-tool.error.graphql.default-message',
    defaultMessage: 'An error occured',
  },
});
