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

interface AutomationActionBarProps {
  datamartId: string;
  automationData: StorylineNodeModel;
}

interface State {
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

  saveAutomation = (formData: AutomationSimpleFormData) => {
    const {
      intl,
      notifyError,
      match: {
        params: { organisationId },
      },
      datamartId,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );
    this.setState({
      isLoading: true,
    });

    const newFormData = {
      name: formData.name,
      datamart_id: datamartId,
    };

    this._scenarioService
      .createScenario(organisationId, newFormData)
      .then((automationRes) => {
        hideSaveInProgress();
        this.redirect();
        message.success(intl.formatMessage(messages.automationSaved));
      })
      .catch((err: any) => {
        this.setState({ isLoading: false });
        notifyError(err);
        hideSaveInProgress();
      });

    // if (isScenarioNodeShape(automationData.node)) {
    //   this._scenarioService
    //     .createScenarioNode(automationData.node)
    //     .then(() => {
    //       hideSaveInProgress();
    //       this.close();
    //       message.success(intl.formatMessage(messages.automationSaved));
    //     })
    //     .catch(err => {
    //       this.setState({ loading: false });
    //       notifyError(err);
    //       hideSaveInProgress();
    //     });
    // }
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
    const { intl, submit } = this.props;

    const { isLoading, visible } = this.state;

    const handleOnSubmit = (formData: AutomationSimpleFormData) => {
      this.setState({ isLoading: true });
    };

    const handleOnOk = () => {
      submit(FORM_ID);
    };

    return (
      <ActionBar
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
          {visible && <AutomationSimpleForm onSubmit={handleOnSubmit} />}
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
