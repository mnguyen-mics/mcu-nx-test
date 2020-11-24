import { Button, Layout, Spin, message } from 'antd';
import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { FormLayoutActionbar } from '../../../../components/Layout';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { UserScenarioResource } from '../../../../models/automations/automations';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import {
  Cookies,
  isUserPointIdentifier,
} from '../../../../models/timeline/timeline';
import { getWorkspace } from '../../../../redux/Session/selectors';
import { IScenarioService } from '../../../../services/ScenarioService';
import { IUserDataService } from '../../../../services/UserDataService';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import messages from './messages';

const { Content } = Layout;

export interface AutomationScenarioTestParams {
  organisationId: string;
  automationId: string;
}

export interface AutomationScenarioTestProps {
  close: () => void;
  datamartId?: string;
  nodeId?: string;
}

interface MapStateToProps {
  cookies: Cookies;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = MapStateToProps &
  AutomationScenarioTestProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<AutomationScenarioTestParams>;

interface State {
  isFetchingUserPointId: boolean;
  userPointId?: string;
}

class AutomationScenarioTest extends React.Component<Props, State> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isFetchingUserPointId: false,
    };
  }

  componentDidMount() {
    const { cookies } = this.props;

    if (cookies.mics_vid) {
      this.fetchUserPointId(cookies.mics_vid);
    }
  }

  fetchUserPointId = (micsVid: string) => {
    const {
      match: {
        params: { organisationId, automationId },
      },
    } = this.props;

    this.setState({ isFetchingUserPointId: true }, () => {
      this._scenarioService
        .getScenario(automationId)
        .then(resAutomationResource => {
          const datamartId = resAutomationResource.data.datamart_id;

          return this._userDataService
            .getIdentifiers(
              organisationId,
              datamartId,
              'user_agent_id',
              `vec:${micsVid}`,
            )
            .then(resUserIdentifierInfo => {
              this.setState({
                isFetchingUserPointId: false,
                userPointId: resUserIdentifierInfo.data.find(
                  isUserPointIdentifier,
                )?.user_point_id,
              });
            });
        })
        .catch(err => {
          this.setState({ isFetchingUserPointId: false });
        });
    });
  };

  getContent = () => {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
      nodeId,
    } = this.props;

    const { userPointId } = this.state;

    const subtitle =
      datamartId && nodeId ? (
        userPointId ? (
          <div className="subtitle">
            <FormattedMessage
              {...messages.contentSubtitle}
              values={{
                userPointId: (
                  <Link
                    to={`/v2/o/${organisationId}/audience/timeline/user_point_id/${userPointId}`}
                    target="_blank"
                  >
                    {userPointId}
                  </Link>
                ),
              }}
            />
            <div className="edit-top">
              <Button
                className={'mcs-primary'}
                type="primary"
                onClick={this.launchTest(datamartId, nodeId, userPointId)}
              >
                <FormattedMessage {...messages.buttonTitle} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="subtitle">
            <FormattedMessage {...messages.contentSubtitleNoUserPoint} />
          </div>
        )
      ) : (
        <div className="subtitle">
          <FormattedMessage {...messages.contentSubtitleNoDatamartIdOrNodeId} />
        </div>
      );

    return (
      <div className="title-container">
        <div className="title">
          <FormattedMessage {...messages.contentTitle} />
        </div>
        {subtitle}
      </div>
    );
  };

  launchTest = (
    datamartId: string,
    nodeId: string,
    userPointId: string,
  ) => () => {
    const {
      match: {
        params: { automationId },
      },
      intl: { formatMessage },
      close,
      notifyError,
    } = this.props;

    const userScenarioResource: UserScenarioResource = {
      datamart_id: datamartId,
      user_point_id: userPointId,
      scenario_id: automationId,
      node_id: nodeId,
    };

    this._scenarioService
      .upsertUserScenarioByUserPointIdAndScenarioId(userScenarioResource)
      .then(resUserScenarioResource => {
        message.success(formatMessage(messages.testSuccessfullyLaunched));
        close();
      })
      .catch(err => {
        notifyError(err);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      close,
    } = this.props;

    const { isFetchingUserPointId } = this.state;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.testActionbarTitle),
      },
    ];

    const actionBarProps = {
      paths: breadcrumbPaths,
      onClose: close,
    };

    const content = isFetchingUserPointId ? (
      <Spin size="small" className="text-center" />
    ) : (
      this.getContent()
    );

    return (
      <Layout className="ant-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Content className="mcs-content-container mcs-form-container">
          {content}
        </Content>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  cookies: state.session.cookies,
  workspace: getWorkspace(state),
});

export default compose<Props, AutomationScenarioTestProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps, undefined),
)(AutomationScenarioTest);
