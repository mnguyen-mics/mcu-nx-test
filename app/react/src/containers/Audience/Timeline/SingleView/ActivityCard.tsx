import * as React from 'react';
import { Row, Icon, Modal } from 'antd';
import moment from 'moment';
import { compose } from 'recompose';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
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
import log from '../../../../utils/Logger';
import { makeCancelable, CancelablePromise } from '../../../../utils/ApiHelper';
import { RouteComponentProps, withRouter } from 'react-router';
import { TimelinePageParams } from '../TimelinePage';
import UserScenarioActivityCard from './UserScenarioActivityCard';
import { ButtonStyleless } from '../../../../components';

const needToDisplayDurationFor = ['SITE_VISIT', 'APP_VISIT'];
enum scenarioActivityTypes {
  'USER_SCENARIO_START',
  'USER_SCENARIO_STOP',
  'USER_SCENARIO_NODE_ENTER',
  'USER_SCENARIO_NODE_EXIT',
  'USER_SCENARIO_NODE_MOVEMENT',
}

interface State {
  siteName?: string;
}

type Props = ActivityCardProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class ActivityCard extends React.Component<Props, State> {
  getChannelPromise: CancelablePromise<any> | undefined = undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      siteName: undefined,
    };
  }

  componentWillUnmount() {
    if (this.getChannelPromise) {
      this.getChannelPromise.cancel();
    }
  }

  getChannelInformation(activity: Activity) {
    if (activity && needToDisplayDurationFor.indexOf(activity.$type) > -1) {
      const id = activity.$site_id ? activity.$site_id : activity.$app_id;
      const prefix = activity.$site_id ? 'Site' : 'App';
      this.getChannelPromise = makeCancelable(
        UserDataService.getChannel(this.props.datamartId, id),
      );
      this.getChannelPromise.promise
        .then(response => {
          this.setState({ siteName: `${prefix}: ${response.data.name}` });
        })
        .catch(err => log.error(err));
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

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
      activity,
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      datamartId: prevDatamartId,
    } = prevProps;
    if (
      organisationId !== prevOrganisationId ||
      datamartId !== prevDatamartId
    ) {
      this.getChannelInformation(activity);
    }
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
      : undefined;
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

  generateCardContent(activity: Activity) {
    const agent = this.getAgentInfoFromAgentId(activity.$user_agent_id);
    const device = agent && agent.device ? agent.device : undefined;
    const longitude =
      activity && activity.$location ? activity.$location.$latlon[1] : 0;
    const latitude =
      activity && activity.$location ? activity.$location.$latlon[0] : 0;
    return (
      <Row>
        <Device vectorId={activity.$user_agent_id} device={device} />
        <Origin origin={activity.$origin} />
        <Location longitude={longitude} latitude={latitude} />
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
    );
  }

  handleJSONViewModal = () => {
    const { activity, intl } = this.props;
    Modal.info({
      title: intl.formatMessage(messages.activityJson),
      okText: intl.formatMessage(messages.eventJsonModalOkText),
      width: '650px',
      content: (
        <SyntaxHighlighter language="json" style={docco}>
          {JSON.stringify(activity, undefined, 4)}
        </SyntaxHighlighter>
      ),
      onOk() {
        //
      },
    });
  };

  render() {
    const { activity } = this.props;
    if (Object.values(scenarioActivityTypes).includes(activity.$type)) {
      return <UserScenarioActivityCard activity={activity} />;
    } else {
      const displayDuration = this.diplayVisitDuration(activity);
      const buttons = (
        <div className="timeline-activity-card-buttons">
          {needToDisplayDurationFor.indexOf(activity.$type) > -1 ? (
            <span>
              <Icon type="clock-circle-o" /> {displayDuration || 0}
              <br />
            </span>
          ) : null}
          <ButtonStyleless
            onClick={this.handleJSONViewModal}
            className="mcs-card-inner-action"
          >
            <FormattedMessage {...messages.viewActivityJson} />
          </ButtonStyleless>
        </div>
      );

      return (
        <Card title={this.state.siteName} buttons={buttons}>
          {this.generateCardContent(activity)}
          <Row className="border-top sm-footer timed-footer text-right">
            {moment(activity.$ts).format('H:mm:ss')}
          </Row>
        </Card>
      );
    }
  }
}

export default compose<Props, ActivityCardProps>(
  injectIntl,
  withRouter,
)(ActivityCard);
