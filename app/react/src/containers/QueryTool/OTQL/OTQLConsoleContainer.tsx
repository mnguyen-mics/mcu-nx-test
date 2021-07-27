import * as React from 'react';
import { Layout, Tabs } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { OTQLResult, QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { DataResponse } from '../../../services/ApiService';
import SchemaVizualizer from '../../Audience/AdvancedSegmentBuilder/SchemaVisualizer/SchemaVizualizer';
import { computeFinalSchemaItem } from '../../Audience/AdvancedSegmentBuilder/domain';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { Loading } from '../../../components';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import OTQLRequest from './OTQLRequest';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;

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
  panes: any[];
  activeKey: string;
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
  private newTabIndex = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryResult: null,
      runningQuery: false,
      queryAborted: false,
      error: null,
      query: props.query || 'SELECT @count{} FROM UserPoint',
      schemaVizOpen: true,
      schemaLoading: false,
      precision: 'FULL_PRECISION',
      evaluateGraphQl: true,
      useCache: false,
      noLiveSchemaFound: false,
      activeKey: '1',
      panes: [
        {
          title: 'Query 1',
          content: <OTQLRequest datamartId={this.props.datamartId} />,
          key: '1',
          closable: false,
        },
      ],
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

  onChange = (activeKey: string) => {
    this.setState({ activeKey });
  };

  onEdit = (targetKey: string, action: string) => {
    // @ts-expect-error
    this[action](targetKey);
  };

  add = () => {
    const { panes } = this.state;
    const activeKey = `newTab${this.newTabIndex++}`;
    const newPanes = [...panes];
    newPanes.push({
      title: `Query ${panes.length + 1}`,
      content: <OTQLRequest datamartId={this.props.datamartId} />,
      key: activeKey,
      closable: true,
    });
    this.setState({
      panes: newPanes,
      activeKey,
    });
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
    this.setState({
      panes: newPanes,
      activeKey: newActiveKey,
    });
  };

  render() {
    const { datamartId } = this.props;
    const { schemaVizOpen, schemaLoading, rawSchema, query, activeKey, panes } = this.state;

    if (schemaLoading) {
      return <Loading isFullScreen={true} />;
    }

    let startType = 'UserPoint';

    if (rawSchema) {
      const foundType = rawSchema.find(ot => {
        return !!query.includes(ot.name);
      });
      if (foundType) {
        startType = foundType.name;
      }
    }

    return (
      <Layout>
        {this.props.renderActionBar(this.state.query, datamartId)}
        <Layout>
          <Layout>
            <Content className='mcs-content-container'>
              <Tabs
                className={'mcs-OTQLConsoleContainer_tabs'}
                type='editable-card'
                onChange={this.onChange}
                activeKey={activeKey}
                onEdit={this.onEdit}
              >
                {panes.map(pane => (
                  <TabPane
                    className={'mcs-OTQLConsoleContainer_tabs_tab'}
                    tab={pane.title}
                    key={pane.key}
                    closable={pane.closable}
                  >
                    {pane.content}
                  </TabPane>
                ))}
              </Tabs>
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
  injectFeatures,
)(OTQLConsoleContainer);
