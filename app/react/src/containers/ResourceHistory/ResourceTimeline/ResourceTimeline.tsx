import * as React from 'react';
import { FlagOutlined } from '@ant-design/icons';
import { Col, Spin, Timeline } from 'antd';
import lodash from 'lodash';
import moment from 'moment';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';

import {
  ResourceType,
  HistoryEventShape,
  ResourceLinkHelper,
} from '../../../models/resourceHistory/ResourceHistory';
import messages from './messages';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import HistoryEventCard from './HistoryEventCard';
import { FormatProperty } from './domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IResourceHistoryService } from '../../../services/ResourceHistoryService';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface Events {
  isLoading: boolean;
  hasItems: boolean;
  items: HistoryEventShape[];
  byDay: {
    [date: string]: HistoryEventShape[];
  };
  byTime: {
    [time: string]: HistoryEventShape[];
  };
}

export interface ResourceTimelineProps {
  resourceType: ResourceType;
  resourceId: string;
  formatProperty: FormatProperty;
  resourceLinkHelper?: ResourceLinkHelper;
}

interface State {
  events: Events;
  nextTime?: string;
  eventCountOnOldestTime: number;
}

type Props = ResourceTimelineProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps;

class ResourceTimeline extends React.Component<Props, State> {
  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      events: {
        isLoading: false,
        hasItems: false,
        items: [],
        byDay: {},
        byTime: {},
      },
      eventCountOnOldestTime: 0,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      resourceType,
      resourceId,
    } = this.props;

    this.fetchEvents(organisationId, resourceType, resourceId);
  }

  groupByDate = (array: any[], key: any) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD');
    });
  };

  groupByTime = (array: any[], key: any) => {
    return lodash.groupBy(array, value => {
      return moment(value[key]).format('YYYY-MM-DD HH:mm:ss');
    });
  };

  fetchEvents = (organisationId: string, resourceType: ResourceType, resourceId: string) => {
    const { nextTime, eventCountOnOldestTime } = this.state;
    const params = nextTime
      ? {
          resource_type: resourceType,
          resource_id: resourceId,
          max_results: 10 + eventCountOnOldestTime,
          to: nextTime,
        }
      : {
          resource_type: resourceType,
          resource_id: resourceId,
          max_results: 10,
        };
    this.setState(
      (prevState: any) => {
        const nextState = {
          events: {
            ...prevState.events,
            isLoading: true,
          },
        };
        return nextState;
      },
      () =>
        this._resourceHistoryService
          .getResourceHistory(organisationId, params)
          .then(response => {
            response.count === 0
              ? this.setState({
                  events: {
                    isLoading: false,
                    hasItems: false,
                    items: [],
                    byDay: {},
                    byTime: {},
                  },
                  eventCountOnOldestTime: 0,
                })
              : this._resourceHistoryService
                  .getResourceHistory(organisationId, {
                    ...params,
                    max_results: params.max_results + 1,
                  })
                  .then(extendedResponse => {
                    this.setState(prevState => {
                      const newData = prevState.events.items.concat(
                        response.data
                          .slice(eventCountOnOldestTime)
                          .map(rhr => {
                            return rhr.events;
                          })
                          .reduce((x, y) => x.concat(y), []),
                      );
                      const nextState = {
                        events: {
                          ...prevState.events,
                          isLoading: false,
                          hasItems: response.count !== extendedResponse.count,
                          items: newData,
                          byDay: this.groupByDate(newData, 'timestamp'),
                          byTime: this.groupByTime(newData, 'timestamp'),
                        },
                        nextTime:
                          response.count !== extendedResponse.count &&
                          response.data &&
                          response.data[response.data.length - 1]
                            ? moment(
                                response.data[response.data.length - 1].events[
                                  response.data[response.data.length - 1].events.length - 1
                                ].timestamp,
                              ).format('x')
                            : undefined,
                        eventCountOnOldestTime: 0,
                      };
                      nextState.eventCountOnOldestTime =
                        nextState.events.byTime[
                          Object.keys(nextState.events.byTime)[
                            Object.keys(nextState.events.byTime).length - 1
                          ]
                        ].length;
                      return nextState;
                    });
                  });
          })
          .catch(err => {
            this.setState(prevState => {
              const nextState = {
                events: {
                  isLoading: false,
                  hasItems: false,
                  items: [],
                  byDay: {},
                  byTime: {},
                },
                eventCountOnOldestTime: 0,
              };
              return nextState;
            });
            this.props.notifyError(err);
          }),
    );
  };

  fetchNewEvents = (e: any) => {
    const {
      match: {
        params: { organisationId },
      },
      resourceType,
      resourceId,
    } = this.props;
    e.preventDefault();
    this.fetchEvents(organisationId, resourceType, resourceId);
  };

  renderPendingTimeline = (events: Events) => {
    if (events.hasItems) {
      return events.isLoading ? (
        <Spin size='small' />
      ) : (
        <button className='mcs-card-inner-action' onClick={this.fetchNewEvents}>
          <FormattedMessage {...messages.seeMore} />
        </button>
      );
    } else {
      return (
        <div className='mcs-title'>
          {events.items.length === 0 ? (
            <FormattedMessage {...messages.noHistory} />
          ) : (
            <FormattedMessage {...messages.noEventsLeft} />
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
      case moment().subtract(1, 'days').format('YYYY-MM-DD'):
        return formatMessage(messages.yesterday);
      default:
        return day;
    }
  };

  render() {
    const { events } = this.state;

    const { formatProperty, resourceType, resourceLinkHelper } = this.props;

    const keys = Object.keys(events.byDay);
    return events.isLoading && !events.hasItems ? (
      <Col span={24} className='text-center'>
        <Spin />
      </Col>
    ) : (
      <Timeline
        pending={this.renderPendingTimeline(events)}
        pendingDot={<McsIcon type='status' className='mcs-timeline-last-dot' />}
      >
        {keys.map(day => {
          const eventsOnDay = events.byDay[day];
          const eventsOnTime = this.groupByTime(eventsOnDay, 'timestamp');

          const dayToFormattedMessage = this.renderDate(day);
          return (
            <div className='mcs-timeline' key={day}>
              <Timeline.Item dot={<FlagOutlined className='mcs-timeline-dot' />}>
                <div className='mcs-title'>{dayToFormattedMessage}</div>
              </Timeline.Item>
              {eventsOnDay.length !== 0 &&
                Object.keys(eventsOnTime).map(time => {
                  return (
                    <Timeline.Item
                      key={`${day}_${time}`}
                      dot={<McsIcon type='status' className={'mcs-timeline-dot'} />}
                    >
                      <HistoryEventCard
                        resourceType={resourceType}
                        events={eventsOnTime[time]}
                        formatProperty={formatProperty}
                        resourceLinkHelper={resourceLinkHelper}
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

export default compose<Props, ResourceTimelineProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(ResourceTimeline);
