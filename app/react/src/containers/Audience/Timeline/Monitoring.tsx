import * as React from 'react';
import { compose } from 'recompose';
import cuid from 'cuid';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Row, Col, Icon, Timeline, Layout, Spin } from 'antd';
import McsIcon from '../../../components/McsIcon';
import {
  Activity,
  UserAgent,
  IdentifiersProps,
  UserSegmentResource,
} from '../../../models/timeline/timeline';
import MonitoringActionbar from './MonitoringActionBar';
import ProfileCard from './SingleView/ProfileCard';
import SegmentsCard from './SingleView/SegmentsCard';
import AccountIdCard from './SingleView/AccountIdCard';
import DeviceCard from './SingleView/DeviceCard';
import EmailCard from './SingleView/EmailCard';
import ActivityCard from './SingleView/ActivityCard';
import TimelineHeader from './TimelineHeader';
import messages from './messages';

const { Content } = Layout;

export interface Activities {
  isLoading: boolean;
  hasItems: boolean;
  items: Activity[];
  byDay: {
    [date: string]: Activity[];
  };
  fetchNewActivities?: () => void; // check type
}

interface MonitoringProps {
  identifiers: IdentifiersProps;
  profile: {
    isLoading: boolean;
    hasItems: boolean;
    items: object; // type better
  };
  segments: {
    isLoading: boolean;
    hasItems: boolean;
    items: UserSegmentResource[];
  };
  activities: Activities;
  datamartId: string;
}

type Props = MonitoringProps & InjectedIntlProps;

class Monitoring extends React.Component<Props> {
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

  getLastSeen = (userAgents: UserAgent[]) => {
    if (userAgents) {
      const formattedAgents = userAgents.map(item => {
        return item.last_activity_ts;
      });
      return Math.max.apply(null, formattedAgents);
    }
    return 0;
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

  render() {
    const {
      segments,
      identifiers,
      activities,
      profile,
      datamartId,
    } = this.props;
    const keys = Object.keys(activities.byDay);
    return (
      <div className="ant-layout">
        <MonitoringActionbar />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <Row>
              <TimelineHeader
                userId={{
                  id:
                    identifiers.items.USER_POINT &&
                    identifiers.items.USER_POINT[0]
                      ? identifiers.items.USER_POINT[0].user_point_id
                      : '',
                  lastSeen: this.getLastSeen(identifiers.items.USER_AGENT),
                }}
              />
              <Row
                gutter={20}
                style={{ marginTop: '20px' }}
                className="mcs-monitoring"
              >
                <Col span={6}>
                  <div className="mcs-subtitle">
                    <FormattedMessage {...messages.visitor} />
                  </div>
                  <ProfileCard profile={profile} />
                  <SegmentsCard segments={segments} />
                </Col>
                <Col span={12}>
                  <div className="mcs-subtitle">
                    <FormattedMessage {...messages.activities} />
                  </div>
                  {activities.isLoading === true &&
                  activities.items.length === 0 ? (
                    <Col span={24} className="text-center">
                      <Spin />
                    </Col>
                  ) : (
                    <Timeline
                      pending={this.renderPendingTimeline(activities)}
                      pendingDot={
                        <McsIcon
                          type="status"
                          className="mcs-timeline-last-dot"
                        />
                      }
                    >
                      {activities.byDay !== {} &&
                        keys.map(day => {
                          const activityOnDay = activities.byDay[day];
                          const dayToFormattedMessage = this.renderDate(day);
                          return (
                            <div className="mcs-timeline" key={cuid()}>
                              <Timeline.Item
                                dot={
                                  <Icon
                                    type="flag"
                                    className="mcs-timeline-dot"
                                  />
                                }
                              >
                                <div className="mcs-title">
                                  {dayToFormattedMessage}
                                </div>
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
                                            activity.$session_status ===
                                            'SESSION_SNAPSHOT'
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
                  )}
                </Col>
                <Col span={6}>
                  <div className="mcs-subtitle">
                    <FormattedMessage {...messages.identifiers} />
                  </div>
                  <AccountIdCard identifiers={identifiers} />
                  <DeviceCard identifiers={identifiers} />
                  <EmailCard identifiers={identifiers} />
                </Col>
              </Row>
            </Row>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, MonitoringProps>(
  injectIntl,
  withRouter,
)(Monitoring);
