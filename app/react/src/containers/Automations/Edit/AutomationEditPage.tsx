import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as NotificationActions from '../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../state/Features/selectors';
import { EditAutomationParam, AutomationFormData } from './domain';
import ScenarioService from '../../../services/ScenarioService';
import AutomationEditForm from './AutomationEditForm';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import {
  AutomationResource,
  AutomationCreateResource,
} from '../../../models/automations/automations';
import messages from './messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { Loading } from '../../../components';

interface State {
  automationFormData: AutomationFormData;
  loading: boolean;
  scenarioContainer: any;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  MapStateProps &
  RouteComponentProps<EditAutomationParam>;

class EditAutomationPage extends React.Component<Props, State> {
  scenarioContainer = (window as any).angular
    .element(document.body)
    .injector()
    .get('core/scenarios/ScenarioContainer');

  state: State = {
    loading: true,
    automationFormData: {
      automation: {},
    },
    scenarioContainer: {},
  };

  AngularSession = (window as any).angular
    .element(document.body)
    .injector()
    .get('core/common/auth/Session');

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      automationFormData: INITIAL_AUTOMATION_DATA,
      scenarioContainer: {
        scenario: {
          id: undefined,
        },
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    this.setState({ loading: true });
    const ScenarioContainer = this.scenarioContainer;
    this.AngularSession.init(this.props.match.params.organisationId)
      .then(() => {
        this.setState({
          scenarioContainer: new ScenarioContainer(
            this.props.match.params.automationId,
          ),
        });
      })
      .then(() => {
        if (automationId) {
          this.fetchInitialData(automationId);
        } else {
          this.setState({ loading: false });
        }
      })
      .catch((err: any) => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  }

  fetchInitialData = (automationId: string) => {
    return ScenarioService.getScenario(automationId)
      .then(res => res.data)
      .then(res =>
        this.setState({
          automationFormData: { automation: res },
          loading: false,
        }),
      )
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  };

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (formData: AutomationFormData) => {
    const generatePromise = () => {
      if (this.props.match.params.automationId) {
        return ScenarioService.updateScenario(
          this.props.match.params.automationId,
          formData.automation as AutomationResource,
        );
      }
      return ScenarioService.createScenario(
        this.props.match.params.organisationId,
        formData.automation as AutomationCreateResource,
      );
    };
    this.setState({ loading: true });
    return generatePromise()
      .then(res => res.data)
      .then(res => this.state.scenarioContainer.saveOrUpdate(res))
      .then(res => {
        this.setState({ loading: false });
        this.props.history.push(
          `/v2/o/${this.props.match.params.organisationId}/automations/list`,
        );
      })
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err.data);
      });
  };

  onClose = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    history.push(`/v2/o/${organisationId}/automations/list`);
  };

  render() {
    const {
      match: {
        params: { organisationId, automationId },
      },
      intl,
    } = this.props;

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle,
        path: `/v2/o/${organisationId}/automations/list`,
      },
      {
        name: automationId
          ? intl.formatMessage(messages.breadcrumbEdit, {
              name: this.state.automationFormData.automation.name,
            })
          : messages.breadcrumbNew,
      },
    ];

    return this.state.loading ? (
      <Loading className="loading-full-screen" />
    ) : (
      <AutomationEditForm
        initialValues={this.state.automationFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
        scenarioContainer={this.state.scenarioContainer}
      />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(
    state => ({
      hasFeature: FeatureSelectors.hasFeature(state),
    }),
    {
      notifyError: NotificationActions.notifyError,
    },
  ),
)(EditAutomationPage);
