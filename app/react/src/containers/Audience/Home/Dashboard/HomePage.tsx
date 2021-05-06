import { Layout } from 'antd';
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
import { DashboardResource } from '../../../../models/dashboards/dashboards';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../../Datamart/WithDatamartSelector';
import { Loading } from '../../../../components';
import DashboardWrapper from '../../Dashboard/DashboardWrapper';
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
import { Error } from '@mediarithmics-private/mcs-components-library';

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
});

interface HomeState {
  dashboards: DashboardResource[];
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
      dashboards: [],
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
    this.loadData(organisationId, selectedDatamartId);
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
      this.loadData(organisationId, selectedDatamartId);
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

  loadData = (organisationId: string, selectedDatamartId: string) => {
    this.setState({ isLoading: true });
    this._dashboardService
      .getDashboards(organisationId, selectedDatamartId, 'HOME', {})
      .then(d => {
        return d.data;
      })
      .then(d => {
        this.setState({ isLoading: false, dashboards: d });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { hasFeature, intl } = this.props;

    const { isLoading, dashboards, datamartAnalyticsDashboardConfig } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={false} />;
    }

    const shouldDisplayAnalyticsFeature = hasFeature(
      'audience-dashboards-datamart_users_analytics',
    );

    if (!isLoading && dashboards.length === 0 && !shouldDisplayAnalyticsFeature) {
      return <Error message={intl.formatMessage(messages.comingSoon)} />;
    }

    return (
      <div className='ant-layout'>
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            {dashboards.map(d => (
              <DashboardWrapper
                key={d.id}
                layout={d.components}
                title={d.name}
                datamartId={d.datamart_id}
              />
            ))}
            {shouldDisplayAnalyticsFeature &&
              dashboards.length === 0 &&
              datamartAnalyticsDashboardConfig.map((conf, i) => {
                return (
                  <DatamartUsersAnalyticsWrapper
                    key={i.toString()}
                    title={conf.title}
                    subTitle={conf.subTitle}
                    datamartId={conf.datamartId}
                    organisationId={conf.organisationId}
                    config={conf.config}
                    showFilter={conf.showFilter}
                    showDateRangePicker={conf.showDateRangePicker}
                    pageTitle={conf.pageTitle}
                  />
                );
              })}
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
