import { Breadcrumb, Layout } from 'antd';
import * as React from 'react';
import { WrappedComponentProps, injectIntl, defineMessages, IntlShape } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { InjectedWorkspaceProps, injectWorkspace } from '../../Datamart/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  TYPES,
  ICustomDashboardService,
  DashboardPageWrapper,
  DashboardLayout,
  ITagService,
  withDatamartSelector,
  WithDatamartSelectorProps,
  lazyInject,
} from '@mediarithmics-private/advanced-components';
import DatamartUsersAnalyticsWrapper from '../../Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import {
  averageSessionDurationConfig,
  channelEngagementConfig,
  acquisitionEngagementConfig,
  ecommerceEngagementConfig,
} from '../../Audience/DatamartUsersAnalytics/config/AnalyticsConfigJson';
import { MentionTag } from '@mediarithmics-private/mcs-components-library';
import DashboardWrapper from '../../Audience/Dashboard/DashboardWrapper';
import {
  DashboardPageContent,
  DatamartUsersAnalyticsWrapperProps,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';
import { defaultDashboard } from './DefaultDashboard';
import { DashboardContentSchema } from '@mediarithmics-private/advanced-components/lib/models/customDashboards/customDashboards';

const { Content } = Layout;

export const messages = defineMessages({
  homeTitle: {
    id: 'home.homeTitle',
    defaultMessage: 'Home',
  },
  channelEngagementsAnalyticsTitle: {
    id: 'home.channelEngagementsAnalyticsTitle',
    defaultMessage: 'Channel Engagement',
  },
  ecommerceEngagementTitle: {
    id: 'home.ecommerceEngagementTitle',
    defaultMessage: 'E-commerce Engagement',
  },
  acquisitionEngagementTitle: {
    id: 'home.acquisitionEngagementTitle',
    defaultMessage: 'Acquisition Engagement',
  },
  dashboardsNewEngineMentionTagTooltip: {
    id: 'home.dashboardsNewEngineMentionTagTooltip',
    defaultMessage:
      'You can see new engine dashboards and old dashboards in tabs. All users don’t have access to this feature yet.',
  },
  contextualTargetingMentionTagTooltip: {
    id: 'home.contextualTargetingMentionTagTooltip',
    defaultMessage:
      'You can see contextual targeting tab. All users don’t have access to this feature yet.',
  },
  setupYourHomePageTitle: {
    id: 'home.setupYourHomePageTitle',
    defaultMessage: 'Setup your home page with dashboards',
  },
  feelFreeToAsk: {
    id: 'home.feelFreeToAsk',
    defaultMessage: 'Feel free to ask your support',
  },
});

interface HomeState {
  isLoading: boolean;
  hasDashboards: boolean;
  datamartAnalyticsDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
}

type JoinedProps = InjectedWorkspaceProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  WithDatamartSelectorProps &
  InjectedFeaturesProps;

class Partition extends React.Component<JoinedProps, HomeState> {
  @lazyInject(TYPES.ICustomDashboardService)
  private _dashboardService: ICustomDashboardService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      isLoading: true,
      hasDashboards: false,
      datamartAnalyticsDashboardConfig: [],
    };
  }

  componentDidMount() {
    const {
      selectedDatamartId,
      intl,
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.setState({
      datamartAnalyticsDashboardConfig: this.getDatamartAnaylicsDashboardConfig(
        organisationId,
        selectedDatamartId,
        intl,
      ),
    });
  }

  componentDidUpdate(prevProps: JoinedProps) {
    const {
      selectedDatamartId,
      intl,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { selectedDatamartId: prevSelectedDatamart } = prevProps;

    if (selectedDatamartId !== prevSelectedDatamart) {
      this.setState({
        isLoading: true,
        hasDashboards: false,
        datamartAnalyticsDashboardConfig: this.getDatamartAnaylicsDashboardConfig(
          organisationId,
          selectedDatamartId,
          intl,
        ),
      });
    }
  }

  getDatamartAnaylicsDashboardConfig = (
    organisationId: string,
    datamartId: string,
    intl: IntlShape,
  ): DatamartUsersAnalyticsWrapperProps[] => {
    return [
      {
        pageTitle: intl.formatMessage(messages.homeTitle),
        datamartId: datamartId,
        organisationId: organisationId,
        config: averageSessionDurationConfig,
        showDateRangePicker: true,
        showFilter: true,
      },
      {
        title: intl.formatMessage(messages.ecommerceEngagementTitle),
        datamartId: datamartId,
        organisationId: organisationId,
        config: ecommerceEngagementConfig,
      },
      {
        title: intl.formatMessage(messages.channelEngagementsAnalyticsTitle),
        datamartId: datamartId,
        organisationId: organisationId,
        config: channelEngagementConfig,
      },
      {
        title: intl.formatMessage(messages.acquisitionEngagementTitle),
        datamartId: datamartId,
        organisationId: organisationId,
        config: acquisitionEngagementConfig,
      },
    ];
  };

  fetchApiDashboards = () => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    return this._dashboardService.getDashboardsPageContents(
      organisationId,
      { archived: false },
      'home',
    );
  };

  fetchDataFileDashboards = () => {
    const {
      match: {
        params: { organisationId },
      },
      selectedDatamartId,
    } = this.props;
    return this._dashboardService.getDataFileDashboards(
      organisationId,
      selectedDatamartId,
      'HOME',
      {},
    );
  };

  handleFinishLoading = (hasDashboards: boolean) => {
    this.setState({
      isLoading: false,
      hasDashboards: hasDashboards,
    });
  };

  render() {
    const {
      hasFeature,
      intl,
      selectedDatamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { isLoading, hasDashboards, datamartAnalyticsDashboardConfig } = this.state;

    const handleOnShowDashboard = (dashboard: DashboardPageContent) => {
      if (dashboard.dashboardRegistrationId) {
        const stats = this._dashboardService.countDashboardsStats(dashboard);
        this._tagService.pushDashboardView(
          'home',
          dashboard.dashboardRegistrationId,
          dashboard.title,
          stats.numberCharts,
          stats.otqlQueries,
          stats.activitiesAnalyticsQueries,
          stats.collectionVolumesQueries,
          stats.resourcesUsageQueries,
          stats.datafileQueries,
        );
      }
    };

    return (
      <div className='ant-layout'>
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            {!isLoading && hasDashboards && (
              <Breadcrumb separator='>' className='mcs-homePage_breadcrumb'>
                <Breadcrumb.Item>
                  Home
                  {hasFeature('dashboards-new-engine') && (
                    <MentionTag
                      mention={'BETA'}
                      customContent={'dashboards-new-engine'}
                      tooltip={intl.formatMessage(messages.dashboardsNewEngineMentionTagTooltip)}
                      className='mcs-homePage_mentionTag'
                    />
                  )}
                </Breadcrumb.Item>
              </Breadcrumb>
            )}
            {(isLoading || (!isLoading && hasDashboards)) && (
              <DashboardPageWrapper
                datamartId={selectedDatamartId}
                organisationId={organisationId}
                datamartAnalyticsConfig={datamartAnalyticsDashboardConfig}
                fetchApiDashboards={this.fetchApiDashboards}
                fetchDataFileDashboards={this.fetchDataFileDashboards}
                isFullScreenLoading={false}
                DatamartUsersAnalyticsWrapper={DatamartUsersAnalyticsWrapper}
                DashboardWrapper={DashboardWrapper}
                className='mcs-homePage_dashboard_page_wrapper'
                onShowDashboard={handleOnShowDashboard}
                onFinishLoading={this.handleFinishLoading}
                queryExecutionSource={'DASHBOARD'}
                queryExecutionSubSource={'HOME_DASHBOARD'}
              />
            )}
            {!isLoading && !hasDashboards && this.renderPlaceholder()}
          </Content>
        </div>
      </div>
    );
  }

  renderPlaceholder = () => {
    const {
      intl,
      selectedDatamartId,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const emptyFunction = () => void 0;

    return (
      <div className='ant-layout'>
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <div className='mcs-content-container_homeContent'>
              <div className='mcs-homeContent_title'>
                {intl.formatMessage(messages.setupYourHomePageTitle)}
              </div>
              <div className='mcs-homeContent_subtitle'>
                {intl.formatMessage(messages.feelFreeToAsk)}
              </div>

              <div className='mcs-homeContent_dashboard'>
                <DashboardLayout
                  intl={intl}
                  editable={false}
                  datamart_id={selectedDatamartId}
                  organisationId={organisationId}
                  schema={defaultDashboard as DashboardContentSchema}
                  openNextDrawer={emptyFunction}
                  closeNextDrawer={emptyFunction}
                  queryExecutionSource={'DASHBOARD'}
                  queryExecutionSubSource={'HOME_DASHBOARD'}
                />
              </div>
            </div>
          </Content>
        </div>
      </div>
    );
  };
}

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectWorkspace,
  injectNotifications,
  injectFeatures,
)(Partition);
