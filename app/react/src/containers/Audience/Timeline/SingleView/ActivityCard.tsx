import * as React from 'react';
import { Row, Icon, Modal } from 'antd';
import moment from 'moment';
import { compose } from 'recompose';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import {
  Activity,
  UserAgentIdentifierInfo,
} from '../../../../models/timeline/timeline';
import { Card } from '../../../../components/Card/index';
import EventActivity from './EventActivity';
import Device from './Device';
import Origin from './Origin';
import Location from './Location';
import Topics from './Topics';
import messages from '../messages';
import log from '../../../../utils/Logger';
import { makeCancelable, CancelablePromise } from '../../../../utils/ApiHelper';
import { RouteComponentProps, withRouter } from 'react-router';
import { TimelinePageParams } from '../TimelinePage';
import UserScenarioActivityCard from './UserScenarioActivityCard';
import { ButtonStyleless } from '../../../../components';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IUserDataService } from '../../../../services/UserDataService';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart';

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

export interface ActivityCardProps {
  activity: Activity;
  selectedDatamart: DatamartResource;
  userAgentsIdentifierInfo?: UserAgentIdentifierInfo[];
}

type Props = ActivityCardProps &
  InjectedIntlProps &
  InjectedWorkspaceProps &
  RouteComponentProps<TimelinePageParams>;

class ActivityCard extends React.Component<Props, State> {
  getChannelPromise: CancelablePromise<any> | undefined = undefined;

  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

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
    const { selectedDatamart, workspace: { community_id, organisation_id }  } = this.props;

    if (activity && needToDisplayDurationFor.indexOf(activity.$type) > -1) {
      const id = activity.$site_id ? activity.$site_id : activity.$app_id;
      const prefix = activity.$site_id ? 'Site' : 'App';
      this.getChannelPromise = makeCancelable(
        (community_id === organisation_id) ?
          this._userDataService.getChannel(id, { community_id: community_id, with_source_datamarts: true }) :
          this._userDataService.getChannel(id, { organisation_id: organisation_id, datamart_id: selectedDatamart.id })
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
      selectedDatamart,
      activity,
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      selectedDatamart: prevSelectedDatamart,
    } = prevProps;
    if (
      organisationId !== prevOrganisationId ||
      selectedDatamart !== prevSelectedDatamart
    ) {
      this.getChannelInformation(activity);
    }
  }

  getAgentInfoFromAgentId = (userAgentId: string) => {
    const { userAgentsIdentifierInfo } = this.props;
    return userAgentId
      ? userAgentsIdentifierInfo &&
          userAgentsIdentifierInfo.find((element: any) => {
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
      activity && activity.$location && activity.$location.$latlon
        ? parseInt(activity.$location.$latlon[1], 10)
        : 0;
    const latitude =
      activity && activity.$location && activity.$location.$latlon
        ? parseInt(activity.$location.$latlon[0], 10)
        : 0;
    return (
      <Row>
        <Device vectorId={activity.$user_agent_id} device={device} />
        <Origin origin={activity.$origin} />
        <Location longitude={longitude} latitude={latitude} />
        <Topics topics={activity.$topics} />
        <div>
          {activity.$events
            .sort((a, b) => {
              return (b.$ts || 0) - (a.$ts || 0);
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
        <Card title={this.state.siteName} buttons={buttons} className={"mcs-activityCard"}>
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
  injectWorkspace,
  withRouter,
)(ActivityCard);
