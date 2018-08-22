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
import messages from './messages';
import { RouteComponentProps, withRouter } from 'react-router';
import { McsIcon } from '../../../components';
import ActivityCard from './SingleView/ActivityCard';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { TimelinePageParams } from './TimelinePage';
import { takeLatest } from '../../../utils/ApiHelper';

const takeLatestActivities = takeLatest(UserDataService.getActivities);

export interface Activities {
  isLoading: boolean;
  hasItems: boolean;
  items: Activity[];
  byDay: {
    [date: string]: Activity[];
  };
}

interface ActivitiesTimelineProps {
  datamartId: string;
  identifier: Identifier;
  identifiers: IdentifiersProps;
}

interface State {
  activities: Activities;
  nextDate?: string;
  activityCountOnOldestDate: number;
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
      activityCountOnOldestDate: 0,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { identifierId, identifierType },
      },
      datamartId,
      identifier,
    } = this.props;
    if (identifier.id && identifier.type) {
      this.fetchActivities(datamartId, identifier.type, identifier.id);
    } else if (identifierId && identifierType) {
      this.fetchActivities(datamartId, identifierType, identifierId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { identifierId, identifierType },
      },
      datamartId,
      location: { search, pathname },
    } = this.props;

    const {
      location: { search: prevSearch, pathname: prevPathname },
    } = prevProps;

    if (search !== prevSearch || pathname !== prevPathname) {
      this.fetchActivities(datamartId, identifierType, identifierId, true);
    }
  }

  groupByDate = (array: any[], key: any) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD');
    });
  };

  removeDuplicatesFromResponse = (data: Activity[], prevActivities: Activity[]) => {
    const sortedData = data.map(activity => {
      return {...activity, $events: activity.$events.sort((a, b) => b.$ts - a.$ts)}
    });
    const sortedPrevActivities = prevActivities.map(activity => {
      return {...activity, $events: activity.$events.sort((a, b) => b.$ts - a.$ts)}
    });
    return prevActivities.length > 0
      ? lodash.differenceWith(sortedData, sortedPrevActivities, lodash.isEqual)
      : data;
  };

  fetchActivities = (
    datamartId: string,
    identifierType: string,
    identifierId: string,
    dataSourceHasChanged: boolean = false,
  ) => {
    const { nextDate, activityCountOnOldestDate } = this.state;
    const params =
      nextDate && !dataSourceHasChanged
        ? { live: true, limit: 10 + activityCountOnOldestDate, to: nextDate }
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
        takeLatestActivities(datamartId, identifierType, identifierId, params)
          .then(response => {
          takeLatestActivities(datamartId, identifierType, identifierId, {...params, limit: params.limit + 1})
            .then(extendedResponse => {
                this.setState(prevState => {
                  const newData = dataSourceHasChanged
                    ? response.data
                    : prevState.activities.items.concat(this.removeDuplicatesFromResponse(response.data, prevState.activities.items));
                  const nextState = {
                    activities: {
                      ...prevState.activities,
                      isLoading: false,
                      hasItems:
                        response.count !== extendedResponse.count,
                      items: newData,
                      byDay: this.groupByDate(newData, '$ts'),
                    },
                    nextDate:
                    response.count !== extendedResponse.count &&
                      response.data &&
                      response.data[response.data.length - 1]
                        ? moment(
                            response.data[response.data.length - 1].$ts,
                          ).add(1, 'day').format('YYYY-MM-DD')
                        : undefined,
                    activityCountOnOldestDate: 0,
                  };
                
                  nextState.activityCountOnOldestDate = (nextState.activities.byDay[Object.keys(nextState.activities.byDay)[Object.keys(nextState.activities.byDay).length - 1]] || []).length
                  return nextState;
                });
              });
          })
          .catch(err => {
            this.setState(prevState => {
              const nextState = {
                activities: {
                  hasItems: false,
                  isLoading: false,
                  items: [],
                  byDay: {},
                },
              };
              return nextState;
            });
          }),
    );
  };

  fetchNewActivities = (e: any) => {
    const {
      match: {
        params: { identifierId, identifierType },
      },
      datamartId,
    } = this.props;
    e.preventDefault();
    this.fetchActivities(datamartId, identifierType, identifierId);
  };

  renderPendingTimeline = (activities: Activities) => {
    if (activities.hasItems && activities.items.length > 0) {
      return activities.isLoading ? (
        <Spin size="small" />
      ) : (
        <button
          className="mcs-card-inner-action"
          onClick={this.fetchNewActivities}
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
        {keys.map(day => {
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
