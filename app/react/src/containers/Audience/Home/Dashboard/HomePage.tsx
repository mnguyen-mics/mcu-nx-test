import { Layout } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  InjectedWorkspaceProps,
  injectWorkspace,
} from '../../../Datamart/index';
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
import Error from '../../../../components/Error';
import DatamartUsersAnalyticsWrapper from '../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedFeaturesProps, injectFeatures } from '../../../Features';
import { DashboardConfig } from '../../DatamartUsersAnalytics/DatamartUsersAnalyticsContent';
import { sessionInTimeJsonConfig } from '../../DatamartUsersAnalytics/components/config/AnalyticsConfigJson';

const { Content } = Layout;

const messages = defineMessages({
  datamartUsersAnalyticsTitle: {
    id: 'audience.home.datamartAnalysisTitle',
    defaultMessage: 'Datamart Users analytics',
  },
  comingSoon: {
    id: 'audience.home.dashboard',
    defaultMessage: 'Coming Soon...',
  },
});

interface HomeState {
  dashboards: DashboardResource[];
  isLoading: boolean;
  datamartAnalyticsConfig: DashboardConfig[];
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

    const dashboardJsonConfig = [
      {
        title: 'Session in time',
        layout: {
          "i": "1",
          "h": 3,
          "static": false,
          "w": 6,
          "x": 0,
          "y": 6
        },
        charts: [
          {
            type: 'AREA',
            options: {
              title: undefined,
              height: 300,
              colors: ['#2fa1de'],
              credits: {
                enabled: false
              },
              chart: {
                reflow: true
              },
              xAxis: {
                ...generateXAxisGridLine(),
                type: 'datetime',
                dateTimeLabelFormats: {
                  day: '%d %b %Y'    // ex- 01 Jan 2016
                },
                title: {
                  text: null
                }
              },
              time: { timezoneOffset: -60, useUTC: true },
              yAxis: {
                ...generateYAxisGridLine(),
                title: {
                  text: null
                }
              },
              legend: {
                enabled: false
              },
              tooltip: {
                shared: true,
                ...generateTooltip()
              }
            },

            xKey: 'date_yyyy_mm_dd',
            metricName: 'sessions'
          }
        ]
      },
      {
        title: 'Session engagement',
        layout: {
          "i": "1",
          "h": 3,
          "static": false,
          "w": 6,
          "x": 6,
          "y": 6
        },
        charts: [
          {
            type: 'SINGLESTAT',
            xKey: 'date_yyyy_mm_dd',
            metricName: 'avg_session_duration'
          }
        ]
      }
    ];

    this.state = {
      dashboards: [],
      isLoading: true,
      datamartAnalyticsConfig: sessionInTimeJsonConfig as any,
    };
  }

  componentDidMount() {
    const { selectedDatamartId } = this.props;
    this.loadData(selectedDatamartId);
  }

  componentDidUpdate(prevProps: JoinedProps) {
    const { selectedDatamartId } = this.props;

    const { selectedDatamartId: prevSelectedDatamart } = prevProps;

    if (selectedDatamartId !== prevSelectedDatamart) {
      this.loadData(selectedDatamartId);
    }
  }

  loadData = (selectedDatamartId: string) => {
    this.setState({ isLoading: true });
    this._dashboardService
      .getDashboards(selectedDatamartId, {
        type: 'HOME',
      })
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
    const {
      hasFeature,
      intl,
      selectedDatamartId,
      selectedDatafarm,
    } = this.props;

    const { isLoading, dashboards, datamartAnalyticsConfig } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    const shouldDisplayAnalyticsFeature =
      hasFeature('audience-dashboards-datamart_users_analytics') &&
      selectedDatafarm === 'DF_EU_2017_09';

    if (
      !isLoading &&
      dashboards.length === 0 &&
      !shouldDisplayAnalyticsFeature
    ) {
      return <Error message={intl.formatMessage(messages.comingSoon)} />;
    }

    return (
      <div className="ant-layout">
        <div className="ant-layout">
          <Content className="mcs-content-container">
            {dashboards.map(d => (
              <DashboardWrapper
                key={d.id}
                layout={d.components}
                title={d.name}
                datamartId={d.datamart_id}
              />
            ))}
            {shouldDisplayAnalyticsFeature && (
              <DatamartUsersAnalyticsWrapper
                title={intl.formatMessage(messages.datamartUsersAnalyticsTitle)}
                datamartId={selectedDatamartId}
                config={datamartAnalyticsConfig}
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
