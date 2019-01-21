import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import queryString from 'query-string';
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
import { DatamartSelector } from '../../Datamart';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { IAutomationFormService } from './AutomationFormService';
import DatamartService from '../../../services/DatamartService';

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
        params: { automationId, organisationId },
      },
      location: { search },
    } = this.props;
    this.setState({ loading: true });
    const datamartId = queryString.parse(search).datamartId;
    if (automationId) {
      const ScenarioContainer = this.scenarioContainer;
      this.AngularSession.init(organisationId)
        .then(() => {
          this.setState({
            scenarioContainer: new ScenarioContainer(automationId),
          });
        })
        .then(() => {
          this._automationFormService
            .loadInitialAutomationValues(automationId)
            .then(res => {
              this.setState({
                automationFormData: res,
                loading: false,
              });
              return res;
            })
            .then(automationFormDataResp => {
              const formDatamartId =
                automationFormDataResp.automation.datamart_id;
              if (formDatamartId) {
                DatamartService.getDatamart(formDatamartId).then(res => {
                  this.setState({
                    datamart: res.data,
                  });
                });
              }
            })
            .catch((err: any) => {
              this.props.notifyError(err);
              this.setState({ loading: false });
            });
        });
    } else if (datamartId && !automationId) {
      DatamartService.getDatamart(datamartId).then(res => {
        this.setState({
          datamart: res.data,
          loading: false,
        });
      });
    }
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (formData: AutomationFormData) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.setState({ loading: true });

    if (formData.automation.datamart_id) {
      DatamartService.getDatamart(formData.automation.datamart_id).then(
        resp => {
          const storageModelVersion = resp.data.storage_model_version;
          this._automationFormService
            .saveOrCreateAutomation(
              organisationId,
              storageModelVersion,
              formData,
            )
            .then(res => {
              if (storageModelVersion !== 'v201709') {
                this.state.scenarioContainer.saveOrUpdate(res.data);
              }
            })
            .then(() => {
              this.setState({ loading: false });
              this.props.history.push(
                `/v2/o/${
                  this.props.match.params.organisationId
                }/automations/list`,
              );
            })
            .catch(err => {
              this.setState({ loading: false });
              this.props.notifyError(err.data);
            });
        },
      );
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

  render() {
    const {
      match: {
        params: { organisationId, automationId },
      },
      intl,
    } = this.props;

    const { datamart } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      this.setState(prevState => {
        return {
          ...prevState,
          datamart: selection,
          automationFormData: {
            automation: {
              ...prevState.automationFormData.automation,
              datamart_id: selection.id,
            },
            automationTreeData: prevState.automationFormData.automationTreeData,
          },
        };
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
    ) : datamart || automationId ? (
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
