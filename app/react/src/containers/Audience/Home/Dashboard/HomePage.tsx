import { Breadcrumb, Layout } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages, InjectedIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../Datamart/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { IDashboardService } from '../../../../services/DashboardServices';
import {
  DashboardPageContent,
  DashboardResource,
  DataFileDashboardResource,
} from '../../../../models/dashboards/dashboards';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../../Datamart/WithDatamartSelector';
import { Loading } from '../../../../components';
import { DatamartUsersAnalyticsWrapperProps } from '../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import {
  averageSessionDurationConfig,
  channelEngagementConfig,
  acquisitionEngagementConfig,
  ecommerceEngagementConfig,
} from '../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import { Error, MentionTag } from '@mediarithmics-private/mcs-components-library';
import DashboardPage from '../../Dashboard/DashboardPage';
import { DataListResponse } from '../../../../services/ApiService';
import { defaultDashboardContent } from '../../DatamartUsersAnalytics/config/DefaultDashboardContentJson';

const { Content } = Layout;

const messages = defineMessages({
  homeTitle: {
    id: 'audience.home.homeTitle',
    defaultMessage: 'Home',
  },
  channelEngagementsAnalyticsTitle: {
    id: 'audience.home.channelEngagementsAnalyticsTitle',
    defaultMessage: 'Channel Engagement',
  },
  ecommerceEngagementTitle: {
    id: 'audience.home.ecommerceEngagementTitle',
    defaultMessage: 'E-commerce Engagement',
  },
  comingSoon: {
    id: 'audience.home.dashboard',
    defaultMessage: 'Coming Soon...',
  },
  acquisitionEngagementTitle: {
    id: 'audience.home.acquisitionEngagementTitle',
    defaultMessage: 'Acquisition Engagement',
  },
  mentionTagTooltip: {
    id: 'audience.home.mentionTagTooltip',
    defaultMessage:
      'You can see new engine dashboards and old dashboards in tabs. All users don’t have access to this feature yet.',
  },
});

interface HomeState {
  dataFileDashboards: DataFileDashboardResource[];
  isLoading: boolean;
  datamartAnalyticsDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
  apiDashboards: DashboardPageContent[];
}

type JoinedProps = InjectedWorkspaceProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  WithDatamartSelectorProps &
  InjectedFeaturesProps;

class Partition extends React.Component<JoinedProps, HomeState> {
  @lazyInject(TYPES.IDashboardService)
  private _dashboardService: IDashboardService;

  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      dataFileDashboards: [],
      isLoading: true,
      datamartAnalyticsDashboardConfig: [],
      apiDashboards: [],
    };
  }

  componentDidMount() {
    const {
      selectedDatamartId,
      intl,
      match: {
        params: { organisationId },
      },
      hasFeature,
    } = this.props;
    this.setState({
      datamartAnalyticsDashboardConfig: this.getDatamartAnaylicsDashboardConfig(
        organisationId,
        selectedDatamartId,
        intl,
      ),
    });
    if (hasFeature('dashboards-new-engine'))
      this.fetchDashboards(organisationId, selectedDatamartId);
    else this.loadData(organisationId, selectedDatamartId);
  }

  componentDidUpdate(prevProps: JoinedProps) {
    const {
      selectedDatamartId,
      intl,
      match: {
        params: { organisationId },
      },
      hasFeature,
    } = this.props;

    const { selectedDatamartId: prevSelectedDatamart } = prevProps;

    if (selectedDatamartId !== prevSelectedDatamart) {
      if (hasFeature('dashboards-new-engine'))
        this.fetchDashboards(organisationId, selectedDatamartId);
      else this.loadData(organisationId, selectedDatamartId);
      this.setState({
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
    intl: InjectedIntl,
  ): DatamartUsersAnalyticsWrapperProps[] => {
    const config = [
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

    return config;
  };

  fetchDashboards = (organisationId: string, selectedDatamartId: string) => {
    this.setState({ isLoading: true });
    const promises: Array<
      Promise<DataListResponse<DataFileDashboardResource | DashboardResource>>
    > = [];
    promises.push(
      this._dashboardService.getDataFileDashboards(organisationId, selectedDatamartId, 'HOME', {}),
    );
    promises.push(
      this._dashboardService.getDashboards(selectedDatamartId, organisationId, { archived: false }),
    );
    Promise.all(promises)
      .then(res => {
        this.setState({
          dataFileDashboards: res[0].data as DataFileDashboardResource[],
          apiDashboards: [],
        });
        const apiDashboards: DashboardResource[] = res[1].data as DashboardResource[];
        if (apiDashboards && apiDashboards.length === 0) this.setState({ isLoading: false });
        else {
          apiDashboards
            .filter(dashboard => dashboard.scopes.some(scope => scope === 'home'))
            .map(dashboard => {
              this._dashboardService
                .getDashboardContent(selectedDatamartId, organisationId, dashboard.id)
                .then(resContent => {
                  this.setState({
                    apiDashboards: this.state.apiDashboards.concat({
                      title: dashboard.title,
                      dashboardContent: JSON.parse(resContent.data.content),
                    }),
                  });
                })
                .catch(err => {
                  this.props.notifyError(err);
                  if (selectedDatamartId === '1500') {
                    this.setState({
                      isLoading: false,
                      apiDashboards: this.state.apiDashboards.concat({
                        title: dashboard.title,
                        dashboardContent: defaultDashboardContent,
                      }),
                    });
                  } else
                    this.setState({
                      isLoading: false,
                      apiDashboards: [],
                    });
                });
            });
          this.setState({ isLoading: false });
        }
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  loadData = (organisationId: string, selectedDatamartId: string) => {
    this.setState({ isLoading: true });
    this._dashboardService
      .getDataFileDashboards(organisationId, selectedDatamartId, 'HOME', {})
      .then(d => {
        return d.data;
      })
      .then(d => {
        this.setState({ isLoading: false, dataFileDashboards: d });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { hasFeature, intl, selectedDatamartId } = this.props;

    const {
      isLoading,
      dataFileDashboards,
      datamartAnalyticsDashboardConfig,
      apiDashboards,
    } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={false} />;
    }

    const shouldDisplayAnalyticsFeature = hasFeature(
      'audience-dashboards-datamart_users_analytics',
    );

    if (!isLoading && dataFileDashboards.length === 0 && !shouldDisplayAnalyticsFeature) {
      return <Error message={intl.formatMessage(messages.comingSoon)} />;
    }

    return (
      <div className='ant-layout'>
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <Breadcrumb separator='>' className='mcs-homePage_breadcrumb'>
              <Breadcrumb.Item>Audience</Breadcrumb.Item>
              <Breadcrumb.Item>
                Home
                {hasFeature('dashboards-new-engine') && (
                  <MentionTag
                    mention={'BETA'}
                    customContent={'dashboards-new-engine'}
                    tooltip={intl.formatMessage(messages.mentionTagTooltip)}
                    className='mcs-homePage_mentionTag'
                  />
                )}
              </Breadcrumb.Item>
            </Breadcrumb>
            {hasFeature('dashboards-new-engine') && (
              <DashboardPage
                datamartId={selectedDatamartId}
                apiDashboards={apiDashboards}
                dataFileDashboards={dataFileDashboards}
                datamartAnalyticsConfig={datamartAnalyticsDashboardConfig}
              />
            )}
            {!hasFeature('dashboards-new-engine') && (
              <DashboardPage
                datamartId={selectedDatamartId}
                dataFileDashboards={dataFileDashboards}
                datamartAnalyticsConfig={datamartAnalyticsDashboardConfig}
              />
            )}
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectWorkspace,
  injectNotifications,
  injectFeatures,
)(Partition);
