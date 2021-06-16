import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications from '../../../../Notifications/injectNotifications';
import DatamartActionBar from './DatamartActionBar';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import DatamartHeader from './DatamartHeader';
import { IDatamartService } from '../../../../../services/DatamartService';
import { Layout } from 'antd';
import { notifyError } from '../../../../../redux/Notifications/actions';
import { McsTabs } from '@mediarithmics-private/mcs-components-library';
import DatamartConfigTab from './DatamartConfigTab';
import DatamartObjectViewTab from './DatamartObjectViewTab';
import DatamartActivity from './DatamartActivity';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import DatamartUsersAnalyticsWrapper from '../../../../Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { sessionInTimeJsonConfig } from '../../../../Audience/DatamartUsersAnalytics/config/AnalyticsConfigJson';
import { DashboardConfig } from '../../../../Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsContent';
import DatamartReplicationTab from './DatamartReplicationTab';
import SegmentBuildersTab from './SegmentBuildersTab';
import AudienceFeatureListPage from '../../AudienceBuilder/List/AudienceFeatureListPage';

interface McsTabsItem {
  title: string;
  display?: JSX.Element;
  forceRender?: boolean;
  key?: string;
}

const { Content } = Layout;

const messages = defineMessages({
  datamartConfiguration: {
    id: 'settings.datamart.configuration',
    defaultMessage: 'Configuration',
  },
  datamartActivity: {
    id: 'settings.datamart.activity',
    defaultMessage: 'Activity',
  },
  datamartReplications: {
    id: 'settings.datamart.replications',
    defaultMessage: 'Replications',
  },
  tableViewConfiguration: {
    id: 'settings.datamart.tableview.configuration',
    defaultMessage: 'Table View Configuration',
  },
  objectViewConfiguration: {
    id: 'settings.datamart.objectview.configuration',
    defaultMessage: 'Object View Configuration',
  },
  statistics: {
    id: 'settings.datamart.statistics',
    defaultMessage: 'Statistics',
  },
  audienceFeatures: {
    id: 'settings.datamart.audienceFeatures',
    defaultMessage: 'Audience Features',
  },
  segmentBuilder: {
    id: 'settings.datamart.segmentBuilder',
    defaultMessage: 'Segment Builders',
  },
});

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedIntlProps &
  InjectedFeaturesProps;

interface State {
  datamart?: DatamartResource;
  isLoading: boolean;
  datamartAnalyticsConfig: DashboardConfig[];
}

class DatamartDashboardPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      datamartAnalyticsConfig: sessionInTimeJsonConfig,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    this.fetchDatamart(datamartId);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { datamartId, organisationId },
      },
      history,
    } = this.props;
    const {
      match: {
        params: { datamartId: prevDatamartId, organisationId: prevOrganisationId },
      },
    } = prevProps;
    if (datamartId !== prevDatamartId) {
      this.fetchDatamart(datamartId);
    }
    if (organisationId !== prevOrganisationId) {
      history.push(`/v2/o/${organisationId}/settings/datamart/datamarts`);
    }
  }

  fetchDatamart = (datamartId: string) => {
    this._datamartService
      .getDatamart(datamartId)
      .then(res =>
        this.setState({
          datamart: res.data,
          isLoading: false,
        }),
      )
      .catch(err => {
        this.setState({ isLoading: false });
        notifyError(err);
      });
  };

  render() {
    const {
      intl,
      match: {
        params: { datamartId, organisationId },
      },
      location,
      hasFeature,
    } = this.props;

    const { datamart, isLoading } = this.state;

    const items: McsTabsItem[] = [
      {
        title: intl.formatMessage(messages.datamartConfiguration),
        display: <DatamartConfigTab datamartId={datamartId} />,
        key: 'configuration',
      },
      {
        title: intl.formatMessage(messages.datamartActivity),
        display: <DatamartActivity datamartId={datamartId} />,
        key: 'activity',
      },
    ];

    if (hasFeature('datamartSettings-datamart_replication')) {
      items.push({
        title: intl.formatMessage(messages.datamartReplications),
        display: <DatamartReplicationTab />,
        key: 'replications',
      });
    }

    if (
      hasFeature('datamart-object_tree_schema') &&
      datamart &&
      datamart.storage_model_version !== 'v201506'
    ) {
      items.push({
        title: intl.formatMessage(messages.objectViewConfiguration),
        display: <DatamartObjectViewTab datamartId={datamartId} />,
        key: 'object_view_configuration',
      });
    }

    if (hasFeature('audience-dashboards-datamart_users_analytics') && datamart) {
      items.push({
        title: intl.formatMessage(messages.statistics),
        display: (
          <Content className='mcs-content-container'>
            <DatamartUsersAnalyticsWrapper
              datamartId={datamart.id}
              organisationId={organisationId}
              config={sessionInTimeJsonConfig}
            />
          </Content>
        ),
        key: 'statistics',
      });
    }

    if (hasFeature('audience-segment_builder_v2')) {
      items.push({
        title: intl.formatMessage(messages.audienceFeatures),
        display: <AudienceFeatureListPage />,
        key: 'audience_features',
      });
      items.push({
        title: intl.formatMessage(messages.segmentBuilder),
        display: <SegmentBuildersTab />,
        key: 'segment_builder',
      });
    }

    return (
      <div className='ant-layout'>
        <DatamartActionBar />
        <div className='ant-layout'>
          <div className='ant-layout-content'>
            <div className='mcs-content-channel'>
              <div className='mcs-datamart-title'>
                <DatamartHeader datamart={datamart} isLoading={isLoading} />
              </div>
            </div>
            <div>
              <McsTabs
                destroyInactiveTabPane={true}
                items={items}
                tabBarStyle={{ margin: '0 40px' }}
                defaultActiveKey={
                  (location && location.state && location.state.activeTab) || 'configuration'
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectFeatures,
)(DatamartDashboardPage);
