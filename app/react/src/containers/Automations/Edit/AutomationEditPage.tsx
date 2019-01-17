import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as NotificationActions from '../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../state/Features/selectors';
import { EditAutomationParam, AutomationFormData } from './domain';
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
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IScenarioService } from '../../../services/ScenarioService';
import { DatamartSelector } from '../../Datamart';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { buildAutomationTreeData } from '../Builder/domain';

interface State {
  automationFormData: AutomationFormData;
  loading: boolean;
  scenarioContainer: any;
  datamart?: DatamartResource;
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

  AngularSession = (window as any).angular
    .element(document.body)
    .injector()
    .get('core/common/auth/Session');

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

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
    const automationPromise = this._scenarioService.getScenario(automationId);
    const storylinePromise = this._scenarioService.getScenarioStoryline(
      automationId,
    );
    const nodePromise = this._scenarioService.getScenarioNodes(automationId);
    const edgePromise = this._scenarioService.getScenarioEdges(automationId);
    return Promise.all([
      automationPromise,
      storylinePromise,
      nodePromise,
      edgePromise,
    ])
      .then(res =>
        this.setState({
          automationFormData: {
            automation: res[0].data,
            automationTreeData: buildAutomationTreeData(
              res[1].data,
              res[2].data,
              res[3].data,
            ),
          },
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
    // TODO :
    const generatePromise = () => {
      if (this.props.match.params.automationId) {
        return this._scenarioService.updateScenario(
          this.props.match.params.automationId,
          formData.automation as AutomationResource,
        );
      }
      return this._scenarioService.createScenario(
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

    const { datamart } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      this.setState({
        datamart: selection,
      });
    };

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
    ) : automationId || datamart ? (
      <AutomationEditForm
        initialValues={this.state.automationFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
        scenarioContainer={this.state.scenarioContainer}
        datamart={datamart}
      />
    ) : (
      <DatamartSelector
        onSelectDatamart={handleOnSelectDatamart}
        actionbarProps={{
          paths: [
            {
              name: intl.formatMessage(messages.automationBuilder),
            },
          ],
          edition: true,
        }}
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
