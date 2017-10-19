import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Icon } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';

import { Card } from '../../../../components/Card/index.ts';
import EventActivity from './EventActivity';
import Device from './Device';
import Origin from './Origin';
import Location from './Location';
import Topics from './Topics';
import UserDataService from '../../../../services/UserDataService';

import messages from '../messages';

const needToDisplayDurationFor = ['SITE_VISIT', 'APP_VISIT'];

class ActivityCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      siteName: null,
      datamartId: props.datamartId,
    };
  }

  getChannelInformation(activity) {

    if (activity && needToDisplayDurationFor.indexOf(activity.$type) > -1) {
      const id = activity.$site_id ? activity.$site_id : activity.$app_id;
      const prefix = activity.$site_id ? 'Site' : 'App';
      UserDataService.getChannel(this.state.datamartId, id).then(response => {
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
    const {
      activity,
      datamartId,
    } = this.props;
    this.getChannelInformation(activity, datamartId);
  }


  componentWillReceiveProps() {
    const {
      activity,
      datamartId,
    } = this.props;
    this.getChannelInformation(activity, datamartId);
  }

  getAgentInfoFromAgentId = (userAgentId) => {
    const {
      identifiers,
    } = this.props;
    const identif = {
      ...identifiers,
    };
    return userAgentId ? identif.items.USER_AGENT.find(element => {
      return element.vector_id === userAgentId;
    }) : null;
  }

  diplayVisitDuration = (activity) => {
    const secs = moment.duration(activity.$session_duration, 'seconds').seconds();
    const min = moment.duration(activity.$session_duration, 'seconds').minutes();
    const hours = moment.duration(activity.$session_duration, 'seconds').hours();
    const days = moment.duration(activity.$session_duration, 'seconds').days();

    const {
      intl: {
        formatMessage,
      }
    } = this.props;

    if (days > 1) {
      return `${days} ${formatMessage(messages.day)} ${hours} ${formatMessage(messages.hours)} ${min} ${formatMessage(messages.minutes)} ${secs} ${formatMessage(messages.seconds)}`;
    } else if (hours >= 1) {
      return `${hours} ${formatMessage(messages.hours)} ${min} ${formatMessage(messages.minutes)} ${secs} ${formatMessage(messages.seconds)}`;
    } else if (min >= 1) {
      return `${min} ${formatMessage(messages.minutes)} ${secs} ${formatMessage(messages.seconds)}`;
    }
    return `${secs} ${formatMessage(messages.seconds)}`;
  }


  render() {
    const {
      activity,
    } = this.props;


    const agent = this.getAgentInfoFromAgentId(activity.$user_agent_id);

    const displayDuration = this.diplayVisitDuration(activity);
    const renderDuration = needToDisplayDurationFor.indexOf(activity.$type) > -1 ? (<span><Icon type="clock-circle-o" /> {displayDuration || 0}</span>) : null;

    return (
      <Card title={this.state.siteName} buttons={renderDuration}>
        <Row>
          <Device vectorId={activity.$user_agent_id} device={(agent && agent.device) ? agent.device : null} />
          <Origin origin={activity.$origin} />
          <Location longitude={(activity && activity.$location) ? activity.$location.$latlon[1] : 0} latitude={(activity && activity.$location) ? activity.$location.$latlon[0] : 0} />
          <Topics topics={activity.$topics} />
          <div>
            {activity.$events.sort((a, b) => { return b.$ts - a.$ts; }).map(event => {
              return (<EventActivity key={event.$event_name + event.$ts} event={event} />);
            })}
          </div>
        </Row>
        <Row className="border-top sm-footer timed-footer text-right">
          { moment(activity.$ts).format('H:mm:ss') }
        </Row>
      </Card>
    );
  }
}

ActivityCard.propTypes = {
  activity: PropTypes.shape({
    $email_hash: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    $events: PropTypes.array,
    $location: PropTypes.object,
    $origin: PropTypes.object,
    $session_duration: PropTypes.number,
    $session_status: PropTypes.string,
    $site_id: PropTypes.string,
    $topics: PropTypes.object,
    $ts: PropTypes.number,
    $ttl: PropTypes.number,
    $type: PropTypes.string,
    $user_account_id: PropTypes.string,
    $user_agent_id: PropTypes.string,
  }).isRequired,
  datamartId: PropTypes.string.isRequired,
  identifiers: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

ActivityCard = injectIntl(ActivityCard);

export default ActivityCard;
