import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { submit as rxfSubmit } from 'redux-form';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  messages,
  AutomationBuilderPageRouteParams,
} from '../AutomationBuilderPage';
import ActionBar from '../../../../components/ActionBar';
import { Button, Modal, message } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { StorylineNodeModel } from '../domain';
import AutomationSimpleForm, {
  AutomationSimpleFormData,
  FORM_ID,
} from './AutomationSimpleForm';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IScenarioService } from '../../../../services/ScenarioService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AutomationResource } from '../../../../models/automations/automations';
import { McsIcon } from '../../../../components';

interface AutomationActionBarProps {
  datamartId: string;
  automationTreeData: StorylineNodeModel;
  onClose?: () => void;
  edition?: boolean;
}

interface State {
  automationData?: AutomationResource;
  isLoading: boolean;
  visible: boolean;
}

interface MapDispatchToProps {
  submit: (formId: string) => void;
}

type Props = AutomationActionBarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  MapDispatchToProps &
  RouteComponentProps<AutomationBuilderPageRouteParams>;

class AutomationActionBar extends React.Component<Props, State> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      visible: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { scenarioId },
      },
    } = this.props;
    if (scenarioId) {
      this._scenarioService.getScenario(scenarioId).then(res => {
        this.setState({
          automationData: res.data,
        });
      });
    }
  }

  saveAutomation = (formData: AutomationSimpleFormData) => {
    const {
      intl,
      notifyError,
      match: {
        params: { organisationId, scenarioId },
      },
      datamartId,
    } = this.props;

    const { automationData } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    this.setState({
      isLoading: true,
    });

    let saveOrCreateScenario;

    if (scenarioId && automationData) {
      saveOrCreateScenario = this._scenarioService.updateScenario(scenarioId, {
        ...automationData,
        ...formData,
      });
    } else {
      saveOrCreateScenario = this._scenarioService.createScenario(
        organisationId,
        { name: formData.name, datamart_id: datamartId },
      );
    }

    saveOrCreateScenario
      .then(() => {
        hideSaveInProgress();
        this.setState({ isLoading: false });
        this.redirect();
        message.success(intl.formatMessage(messages.automationSaved));
      })
      .catch((err: any) => {
        this.setState({ isLoading: false });
        notifyError(err);
        hideSaveInProgress();
      });
  };

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const url = `/v2/o/${organisationId}/automations/list`;

    return history.push(url);
  };

  handleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { intl, submit, edition, onClose } = this.props;

    const { isLoading, visible } = this.state;

    const handleOnOk = () => {
      submit(FORM_ID);
    };

    return (
      <ActionBar
        edition={edition}
        paths={[
          {
            name: intl.formatMessage(messages.automationBuilder),
          },
        ]}
      >
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.handleModal}
        >
          <FormattedMessage
            id="automation.builder.action.bar.save"
            defaultMessage="Save"
          />
        </Button>
        {onClose && (
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        )}
        <Modal
          visible={visible}
          onOk={handleOnOk}
          onCancel={this.handleModal}
          confirmLoading={isLoading}
          title={
            <FormattedMessage
              id="automation.builder.page.actionbar.modal.title"
              defaultMessage="Save Automation"
            />
          }
        >
          {visible && <AutomationSimpleForm onSubmit={this.saveAutomation} />}
        </Modal>
      </ActionBar>
    );
  }
}

export default compose<Props, AutomationActionBarProps>(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(
    undefined,
    { submit: rxfSubmit },
  ),
)(AutomationActionBar);
