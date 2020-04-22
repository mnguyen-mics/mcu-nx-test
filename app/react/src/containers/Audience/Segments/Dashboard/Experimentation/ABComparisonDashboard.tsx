import * as React from 'react';
import { compose } from 'recompose';
import _ from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router';
// import { Card } from '../../../../../components/Card';
// import McsTabs from '../../../../../components/McsTabs';
import { EditAudienceSegmentParam } from '../../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import FeedCardList from './../Feeds/FeedCardList';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import ABComparisonGauge from './ABComparisonGauge';
import { HomeDashboardConfig } from '../../../Home/Dashboard/HomePage';
import { messagesMap } from '../Experimentation/AudienceExperimentationForm';
import { averageSessionDurationConfig } from '../../../DatamartUsersAnalytics/config/AnalyticsConfigJson';
import DatamartUsersAnalyticsWrapper from '../../../DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';

const messages = defineMessages({
  revenue: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.revenue',
    defaultMessage: 'Revenue',
  },
  avgTransactionAmount: {
    id:
      'audience.segments.dashboard.ABComparisonDashboard.avgTransactionAmount',
    defaultMessage: 'Avg Transaction Amount',
  },
  nbOfTransactions: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.nbOfTransactions',
    defaultMessage: '# of transactions',
  },
  avgSessionDuration: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.avgSessionDuration',
    defaultMessage: 'Avg Session Duration',
  },
  eventsPerSession: {
    id: 'audience.segments.dashboard.ABComparisonDashboard.eventsPerSession',
    defaultMessage: 'Events Per Session',
  },
});

interface State {
  ABComparisonDashboardConfig: HomeDashboardConfig[];
}

export interface ABComparisonDashboardProps {
  experimentationSegment?: UserQuerySegment;
  controlGroupSegment?: UserQuerySegment;
}

type Props = ABComparisonDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class ABComparisonDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ABComparisonDashboardConfig: [],
    };
  }

  componentDidMount() {
    const {
      experimentationSegment,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    if (experimentationSegment)
      this.setState({
        ABComparisonDashboardConfig: [
          {
            title: intl.formatMessage(messagesMap.channelEngagement),
            datamartId: experimentationSegment.datamart_id,
            config: averageSessionDurationConfig,
            organisationId: organisationId,
          },
        ],
      });
  }

  componentDidUpdate(prevProps: Props) {
    const { controlGroupSegment, experimentationSegment } = this.props;
    const {
      controlGroupSegment: prevControlGroupSegment,
      experimentationSegment: prevExperimentationSegment,
    } = prevProps;
    if (
      (!_.isEqual(prevControlGroupSegment, controlGroupSegment) ||
        !_.isEqual(prevExperimentationSegment, experimentationSegment)) &&
      controlGroupSegment &&
      controlGroupSegment.id &&
      experimentationSegment &&
      experimentationSegment.id
    ) {
      this.setState(prevState => {
        const nexState = {
          ...prevState,
          config: averageSessionDurationConfig.map(config => {
            return {
              ...config,
              segments: {
                baseSegmentId: controlGroupSegment.id,
                segmentIdToCompareWith: experimentationSegment.id,
              },
            };
          }),
        };
        return nexState;
      });
    }
  }

  buildItems = () => {
    const { intl } = this.props;

    return [
      {
        title: intl.formatMessage(messages.revenue),
        display: <div>Coming soon...</div>,
      },
      {
        title: intl.formatMessage(messages.avgTransactionAmount),
        display: <div>Coming soon...</div>,
      },
      {
        title: intl.formatMessage(messages.nbOfTransactions),
        display: <div>Coming soon...</div>,
      },
      {
        title: intl.formatMessage(messages.avgSessionDuration),
        display: <div>Coming soon...</div>,
      },
      {
        title: intl.formatMessage(messages.eventsPerSession),
        display: <div>Coming soon...</div>,
      },
    ];
  };

  render() {
    const { experimentationSegment } = this.props;
    const { ABComparisonDashboardConfig } = this.state;
    return (
      <div>
        <ABComparisonGauge
          weight={experimentationSegment && experimentationSegment.weight}
        />
        {/* We will need it soon so let's keep it */}
        {/* <Card>
          <McsTabs items={this.buildItems()} />
        </Card> */}
        {ABComparisonDashboardConfig.map((conf, i) => {
          return (
            <DatamartUsersAnalyticsWrapper
              key={i.toString()}
              title={conf.title}
              subTitle={conf.subTitle}
              datamartId={conf.datamartId}
              organisationId={conf.organisationId}
              config={conf.config}
              showFilter={conf.showFilter}
            />
          );
        })}
        <FeedCardList />
      </div>
    );
  }
}

export default compose<Props, ABComparisonDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(ABComparisonDashboard);
