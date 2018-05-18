import * as React from 'react';
import { Row, Icon } from 'antd';
import moment from 'moment';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  Activity,
  ActivityCardProps,
} from '../../../../models/timeline/timeline';
import { Card } from '../../../../components/Card/index';
import EventActivity from './EventActivity';
import Device from './Device';
import Origin from './Origin';
import Location from './Location';
import Topics from './Topics';
import UserDataService from '../../../../services/UserDataService';
import messages from '../messages';

const needToDisplayDurationFor = ['SITE_VISIT', 'APP_VISIT'];

interface State {
  siteName?: string;
}

type Props = ActivityCardProps & InjectedIntlProps;

class ActivityCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      siteName: undefined,
    };
  }

  getChannelInformation(activity: Activity) {
    if (activity && needToDisplayDurationFor.indexOf(activity.$type) > -1) {
      const id = activity.$site_id ? activity.$site_id : activity.$app_id;
      const prefix = activity.$site_id ? 'Site' : 'App';
      UserDataService.getChannel(this.props.datamartId, id).then(response => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.siteName = `${prefix}: ${response.data.name}`;
          return nextState;
        });
      });
    } else {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        switch (activity.$type) {
          case 'TOUCH':
            nextState.siteName = 'Touch';
            break;
          case 'EMAIL':
            nextState.siteName = 'Email';
            break;
          case 'DISPLAY_AD':
            nextState.siteName = 'Display Ad';
            break;
          case 'STOPWATCH':
            nextState.siteName = 'Stopwatch';
            break;
          case 'RECOMMENDER':
            nextState.siteName = 'Recommender';
            break;
          default:
            nextState.siteName = activity.$type;
            break;
        }
        return nextState;
      });
    }
  }

  componentDidMount() {
    const { activity } = this.props;
    this.getChannelInformation(activity);
  }

  componentWillReceiveProps() {
    const { activity } = this.props;
    this.getChannelInformation(activity);
  }

  getAgentInfoFromAgentId = (userAgentId: string) => {
    const { identifiers } = this.props;
    const identif = {
      ...identifiers,
    };
    return userAgentId
      ? identif &&
          identif.items &&
          identif.items.USER_AGENT &&
          identif.items.USER_AGENT.find((element: any) => {
            return element.vector_id === userAgentId;
          })
      : null;
  };

  diplayVisitDuration = (activity: Activity) => {
    const secs = moment
      .duration(activity.$session_duration, 'seconds')
      .seconds();
    const min = moment
      .duration(activity.$session_duration, 'seconds')
      .minutes();
    const hours = moment
      .duration(activity.$session_duration, 'seconds')
      .hours();
    const days = moment.duration(activity.$session_duration, 'seconds').days();

    const {
      intl: { formatMessage },
    } = this.props;

    if (days > 1) {
      return `${days} ${formatMessage(messages.day)} ${hours} ${formatMessage(
        messages.hours,
      )} ${min} ${formatMessage(messages.minutes)} ${secs} ${formatMessage(
        messages.seconds,
      )}`;
    } else if (hours >= 1) {
      return `${hours} ${formatMessage(messages.hours)} ${min} ${formatMessage(
        messages.minutes,
      )} ${secs} ${formatMessage(messages.seconds)}`;
    } else if (min >= 1) {
      return `${min} ${formatMessage(messages.minutes)} ${secs} ${formatMessage(
        messages.seconds,
      )}`;
    }
    return `${secs} ${formatMessage(messages.seconds)}`;
  };

  render() {
    const { activity } = this.props;

    const agent = this.getAgentInfoFromAgentId(activity.$user_agent_id);

    const displayDuration = this.diplayVisitDuration(activity);
    const renderDuration =
      needToDisplayDurationFor.indexOf(activity.$type) > -1 ? (
        <span>
          <Icon type="clock-circle-o" /> {displayDuration || 0}
        </span>
      ) : null;

    return (
      <Card title={this.state.siteName} buttons={renderDuration}>
        <Row>
          <Device
            vectorId={activity.$user_agent_id}
            device={agent && agent.device ? agent.device : null}
          />
          <Origin origin={activity.$origin} />
          <Location
            longitude={
              activity && activity.$location ? activity.$location.$latlon[1] : 0
            }
            latitude={
              activity && activity.$location ? activity.$location.$latlon[0] : 0
            }
          />
          <Topics topics={activity.$topics} />
          <div>
            {activity.$events
              .sort((a, b) => {
                return b.$ts - a.$ts;
              })
              .map(event => {
                return (
                  <EventActivity
                    key={event.$event_name + event.$ts}
                    event={event}
                  />
                );
              })}
          </div>
        </Row>
        <Row className="border-top sm-footer timed-footer text-right">
          {moment(activity.$ts).format('H:mm:ss')}
        </Row>
      </Card>
    );
  }
}

export default compose<Props, ActivityCardProps>(injectIntl)(ActivityCard);
