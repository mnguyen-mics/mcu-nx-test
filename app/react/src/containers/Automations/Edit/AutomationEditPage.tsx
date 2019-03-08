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
import messages from './messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { Loading } from '../../../components';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { IAutomationFormService } from './AutomationFormService';
import DatamartService from '../../../services/DatamartService';
import { IScenarioService } from '../../../services/ScenarioService';
import AutomationBuilderContainer from '../Builder/AutomationBuilderContainer';

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

  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
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
        params: { automationId, organisationId },
      },
    } = this.props;
   

    if (automationId && organisationId) {
      this.loadData(organisationId, automationId)
    } 
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { automationId, organisationId },
      },
    } = this.props;

    const {
      match: {
        params: { automationId: prevAutomationId, organisationId: prevOrganisationId },
      },
    } = prevProps;

    if (automationId && (automationId !== prevAutomationId || organisationId !== prevOrganisationId)) {
      this.loadData(organisationId, automationId)
    }
  }

  loadData = (organisationId: string, automationId: string) => {
    this.setState({ loading: true });
    this._scenarioService.getScenario(automationId)
      .then((r) => DatamartService.getDatamart(r.data.datamart_id))
      .then(r => {
        const datafarmVersion = r.data.storage_model_version;
        if (datafarmVersion === 'v201506') {
          const ScenarioContainer = this.scenarioContainer;
          this.AngularSession.init(organisationId)
          return this._automationFormService.loadInitialAutomationValues(automationId, 'v201506')
            .then(data => {
              this.setState({
                datamart: r.data,
                automationFormData: data,
                loading: false,
                scenarioContainer: ScenarioContainer
              })
            })
        }
        return this._automationFormService.loadInitialAutomationValues(automationId, datafarmVersion)
          .then((data) => {
            this.setState({
              datamart: r.data,
              automationFormData: data,
              loading: false,
            })
          })
      })
      .catch((err: any) => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (formData: AutomationFormData) => {
    const {
      match: {
        params: { organisationId, automationId },
      },
    } = this.props;

    const { datamart } = this.state;

    if (datamart) {
      this.setState({ loading: true });
      const saveOrUpdate = this._automationFormService.saveOrCreateAutomation(organisationId, datamart.storage_model_version, formData)
      if (datamart.storage_model_version === 'v201506') {
        saveOrUpdate.then((res) => {
          this.state.scenarioContainer.saveOrUpdate(res.data);
        })
      }
      saveOrUpdate
        .then(() => {
          this.setState({ loading: false });
          this.props.history.push(
            `/v2/o/${this.props.match.params.organisationId}/automations/${automationId}`,
          );
        })
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err.data);
      });
    }
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



  renderEditPage = (datamart: DatamartResource, organisationId: string, automationId: string) => {
    const { intl } = this.props;
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

    switch (datamart.storage_model_version) {
      case 'v201506':
        return (
          <AutomationEditForm
            initialValues={this.state.automationFormData}
            onSubmit={this.save}
            close={this.onClose}
            breadCrumbPaths={breadcrumbPaths}
            onSubmitFail={this.onSubmitFail}
            scenarioContainer={this.state.scenarioContainer}
            datamart={datamart}
          />
        )
      default:
        return (
          <AutomationBuilderContainer 
            datamartId={datamart.id}
            automationFormData={this.state.automationFormData}
            saveOrUpdate={this.save}
            loading={this.state.loading}
            edition={true}
          />
          
        )
    }
    return <div />
  }

  render() {
    const {
      match: {
        params: { organisationId, automationId },
      },
    } = this.props;

    const { loading, datamart } = this.state;
    
    if (loading) {
      return <Loading className="loading-full-screen" />
    }

    if (automationId && !loading && datamart) {
      return this.renderEditPage(datamart, organisationId, automationId)
    }

    return 'The automation you are trying to load doesn\'t seem to exist or you don\'t have the right to view it'

   
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
