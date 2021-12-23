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
  DashboardPageWrapper,
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '@mediarithmics-private/advanced-components';
import DatamartUsersAnalyticsWrapper, {
  DatamartUsersAnalyticsWrapperProps,
} from '../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import {
  averageSessionDurationConfig,
  channelEngagementConfig,
  acquisitionEngagementConfig,
  ecommerceEngagementConfig,
} from '../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import { MentionTag } from '@mediarithmics-private/mcs-components-library';
import DashboardWrapper from '../../Dashboard/DashboardWrapper';

const { Content } = Layout;

export const messages = defineMessages({
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
  isLoading: boolean;
  datamartAnalyticsDashboardConfig: DatamartUsersAnalyticsWrapperProps[];
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
      isLoading: true,
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

  render() {
    const { hasFeature, intl, selectedDatamartId } = this.props;

    const { datamartAnalyticsDashboardConfig } = this.state;

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
            <DashboardPageWrapper
              datamartId={selectedDatamartId}
              datamartAnalyticsConfig={datamartAnalyticsDashboardConfig}
              fetchApiDashboards={this.fetchApiDashboards}
              fetchDataFileDashboards={this.fetchDataFileDashboards}
              isFullScreenLoading={false}
              DatamartUsersAnalyticsWrapper={DatamartUsersAnalyticsWrapper}
              DashboardWrapper={DashboardWrapper}
            />
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
