import * as React from 'react';
import { Alert, Layout, Tabs } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { makeCancelable, CancelablePromise } from '../../../utils/ApiHelper';
import { OTQLResult, QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
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
  content: JSX.Element;
  closable: boolean;
}

interface TabQuery {
  id: string;
  query: string;
}

export interface OTQLConsoleContainerProps {
  datamartId: string;
  renderActionBar: (query: string, datamartId: string) => React.ReactNode;
  query?: string;
  queryEditorClassName?: string;
  editionMode?: boolean;
  createdQueryId?: string;
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
  panes: McsTabsItem[];
  activeKey: string;
  tabQueries: TabQuery[];
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
      panes: [],
      tabQueries: [],
    };
  }

  getCurrentTabQuery = (tabIndex: string, query: string) => {
    const { tabQueries } = this.state;
    const existingQuery = tabQueries.find((tabQ: TabQuery) => tabQ.id === tabIndex);
    if (existingQuery) {
      tabQueries.forEach((tabQ: TabQuery, i: number) => {
        if (tabQ.id === tabIndex) {
          tabQueries[i].query = query;
        }
      });
    } else {
      tabQueries.push({
        id: tabIndex,
        query,
      });
    }

    this.setState({
      tabQueries,
    });
  };

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
    const { query, editionMode } = this.props;

    if (panes.length === 1) {
      panes[0].closable = true;
    }

    const newPanes = [...panes];
    const newKey = newPanes.length > 0 ? parseInt(newPanes[newPanes.length - 1].key, 10) + 1 : 1;
    const activeKey = newKey.toString();
    newPanes.push({
      title: `Query ${newKey}`,
      content: (
        <OTQLRequest
          datamartId={this.props.datamartId}
          setQuery={this.getCurrentTabQuery.bind(this, activeKey)}
          query={editionMode && query?.includes('where') ? query : undefined}
        />
      ),
      key: activeKey,
      closable: !!(this.state.panes.length > 0),
    });
    this.setState({
      panes: newPanes,
      activeKey,
    });
  };

  remove = (targetKey: string) => {
    const { panes, activeKey, tabQueries } = this.state;
    let newActiveKey = activeKey;
    let lastIndex;

    const newTabQueries = tabQueries;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });

    const newPanes = panes.filter(pane => pane.key !== targetKey);

    newTabQueries.filter((tabQuery: TabQuery) => tabQuery.id !== targetKey);

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
      tabQueries: newTabQueries,
    });
  };

  render() {
    const { datamartId, intl, editionMode, createdQueryId } = this.props;
    const { schemaLoading, rawSchema, activeKey, panes, tabQueries, query } = this.state;

    if (schemaLoading) {
      return <Loading isFullScreen={true} />;
    }

    const currentQuery =
      tabQueries.length > 0
        ? tabQueries.find((tabQ: TabQuery) => tabQ.id === activeKey)
        : undefined;

    const firstTabQuery = tabQueries.find(t => t.id === '1');
    const exportQuery = currentQuery ? currentQuery.query : this.state.query;
    const queryToUse = editionMode ? (firstTabQuery ? firstTabQuery.query : query) : exportQuery;

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
    return (
      <Layout>
        {this.state.query && this.props.renderActionBar(queryToUse, datamartId)}
        <Layout>
          <Content className='mcs-content-container'>
            <Tabs
              className={'mcs-OTQLConsoleContainer_tabs'}
              type='editable-card'
              onChange={this.onChange}
              activeKey={activeKey}
              onEdit={this.onEdit}
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
                    {pane.content}
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
                  </div>
                </TabPane>
              ))}
            </Tabs>
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
