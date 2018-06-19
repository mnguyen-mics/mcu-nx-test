import * as React from 'react';
import lodash from 'lodash';
import { Timeline, Icon, Col, Spin } from 'antd';
import moment from 'moment';
import cuid from 'cuid';
import { compose } from 'recompose';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';

import UserDataService from '../../../services/UserDataService';
import { Activity, IdentifiersProps } from '../../../models/timeline/timeline';
import { Identifier } from './Monitoring';
import { takeLatest } from '../../../utils/ApiHelper';
import messages from './messages';
import { RouteComponentProps, withRouter } from 'react-router';
import { McsIcon } from '../../../components';
import ActivityCard from './SingleView/ActivityCard';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { TimelinePageParams } from './TimelinePage';

const takeLatestActivities = takeLatest(UserDataService.getActivities);

export interface Activities {
  isLoading: boolean;
  hasItems: boolean;
  items: Activity[];
  byDay: {
    [date: string]: Activity[];
  };
  nextDate?: string;
  fetchNewActivities?: (e: any) => void;
}

interface ActivitiesTimelineProps {
  datamartId: string;
  identifier: Identifier;
  identifiers: IdentifiersProps;
}

interface State {
  activities: Activities;
}

type Props = ActivitiesTimelineProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class ActivitiesTimeline extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activities: {
        isLoading: false,
        hasItems: false,
        items: [],
        byDay: {},
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      datamartId,
      identifier,
    } = this.props;
    if (identifier.id && identifier.type) {
      this.fetchActivitiesData(
        organisationId,
        datamartId,
        identifier.type,
        identifier.id,
      );
    } else if (identifierId && identifierType) {
      this.fetchActivitiesData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId, identifierId, identifierType },
      },
      datamartId,
    } = this.props;

    const {
      match: {
        params: {
          identifierId: prevIdentifierId,
         //  identifierType: prevIdentifierType,
        },
      },
    } = prevProps;

    if (
      !prevIdentifierId &&
      identifierId &&
      identifierType
    ) {
      this.fetchActivitiesData(
        organisationId,
        datamartId,
        identifierType,
        identifierId,
      );
    }
  }

  groupByDate = (array: any[], key: any) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD');
    });
  };

  fetchActivitiesData = (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    to: string = '',
  ) => {
    const params = to
      ? { live: true, limit: 10, to: to }
      : { live: true, limit: 10 };
    this.setState(
      (prevState: any) => {
        const nextState = {
          activities: {
            ...prevState.activities,
            isLoading: true,
          },
        };
        return nextState;
      },
      () =>
        takeLatestActivities(
          organisationId,
          datamartId,
          identifierType,
          identifierId,
          params,
        )
          .then((response: any) => {
            this.setState((prevState: any) => {
              const nextState = {
                activities: {
                  ...prevState.activities,
                  isLoading: false,
                  hasItems: response.data.length === 10,
                  items: prevState.activities.items.concat(response.data),
                  byDay: this.groupByDate(
                    prevState.activities.items.concat(response.data),
                    '$ts',
                  ),
                  nextDate:
                    response.data.length > 10
                      ? moment(
                          response.data[response.data.length - 1].$ts,
                        ).format('YYYY-MM-DD')
                      : null,
                  fetchNewActivities: (e: any) => {
                    e.preventDefault();
                    this.fetchActivitiesData(
                      organisationId,
                      datamartId,
                      identifierType,
                      identifierId,
                      moment(
                        response.data[response.data.length - 1].$ts,
                      ).format('YYYY-MM-DD'),
                    );
                  },
                },
              };
              return nextState;
            });
          })
          .catch(err => {
            this.setState((prevState: any) => {
              const nextState = {
                activities: {
                  ...prevState.activities,
                  hasItems: false,
                  isLoading: false,
                },
              };
              return nextState;
            });
            this.props.notifyError(err);
          }),
    );
  };

  renderPendingTimeline = (activities: Activities) => {
    if (activities.hasItems && activities.items.length > 0) {
      return activities.isLoading ? (
        <Spin size="small" />
      ) : (
        <button
          className="mcs-card-inner-action"
          onClick={activities.fetchNewActivities}
        >
          <FormattedMessage {...messages.seeMore} />
        </button>
      );
    } else {
      return (
        <div className="mcs-title">
          {activities.hasItems ? (
            <FormattedMessage {...messages.noActivities} />
          ) : (
            <FormattedMessage {...messages.noActivitiesLeft} />
          )}
        </div>
      );
    }
  };

  renderDate = (day: string) => {
    const {
      intl: { formatMessage },
    } = this.props;
    switch (day) {
      case moment().format('YYYY-MM-DD'):
        return formatMessage(messages.today);
      case moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'):
        return formatMessage(messages.yesterday);
      default:
        return day;
    }
  };

  render() {
    const { activities } = this.state;
    const { datamartId, identifiers } = this.props;

    const keys = Object.keys(activities.byDay);
    return activities.isLoading === true && activities.items.length === 0 ? (
      <Col span={24} className="text-center">
        <Spin />
      </Col>
    ) : (
      <Timeline
        pending={this.renderPendingTimeline(activities)}
        pendingDot={<McsIcon type="status" className="mcs-timeline-last-dot" />}
      >
        {activities.byDay !== {} &&
          keys.map(day => {
            const activityOnDay = activities.byDay[day];
            const dayToFormattedMessage = this.renderDate(day);
            return (
              <div className="mcs-timeline" key={cuid()}>
                <Timeline.Item
                  dot={<Icon type="flag" className="mcs-timeline-dot" />}
                >
                  <div className="mcs-title">{dayToFormattedMessage}</div>
                </Timeline.Item>
                {activityOnDay.length !== 0 &&
                  activityOnDay.map((activity: Activity) => {
                    return (
                      <Timeline.Item
                        key={cuid()}
                        dot={
                          <McsIcon
                            type="status"
                            className={
                              activity.$session_status === 'SESSION_SNAPSHOT'
                                ? 'mcs-timeline-dot live'
                                : 'mcs-timeline-dot'
                            }
                          />
                        }
                      >
                        <ActivityCard
                          activity={activity}
                          datamartId={datamartId}
                          identifiers={identifiers}
                        />
                      </Timeline.Item>
                    );
                  })}
              </div>
            );
          })}
      </Timeline>
    );
  }
}

export default compose<Props, ActivitiesTimelineProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(ActivitiesTimeline);
