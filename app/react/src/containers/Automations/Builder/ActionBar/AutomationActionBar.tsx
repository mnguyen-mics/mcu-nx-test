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
import { Button, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import AutomationSimpleForm, { FORM_ID } from './AutomationSimpleForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AutomationResource } from '../../../../models/automations/automations';
import { McsIcon } from '../../../../components';

interface AutomationActionBarProps {
  datamartId: string;
  automation?: AutomationResource;
  saveOrUpdate: () => void;
  onClose?: () => void;
  edition?: boolean;
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
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      visible: false,
    };
  }

  onSave = () => {
    const { edition } = this.props;
    if (edition) {
      this.props.saveOrUpdate();
    } else {
      this.handleModal();
    }
  };

  handleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const {
      intl,
      submit,
      edition,
      onClose,
      automation,
      saveOrUpdate,
    } = this.props;

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
          {
            name: automation
              ? automation.name
              : intl.formatMessage(messages.newAutomation),
          },
        ]}
      >
        <Button className="mcs-primary" type="primary" onClick={this.onSave}>
          {edition
            ? intl.formatMessage(messages.updateAutomation)
            : intl.formatMessage(messages.saveAutomation)}
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
          {visible && <AutomationSimpleForm onSubmit={saveOrUpdate} />}
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
