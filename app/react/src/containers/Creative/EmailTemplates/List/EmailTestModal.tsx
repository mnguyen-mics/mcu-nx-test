import * as React from 'react';
import { Modal, Input, Alert } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import CreativeService from '../../../../services/CreativeService';
import * as actions from '../../../../state/Notifications/actions';

const messages = defineMessages({
  modalTitle: {
    id: 'email.campaign.sendTest.modal.title',
    defaultMessage: 'Test your Template',
  },
  modalBody1: {
    id: 'email.campaign.sendTest.modal.body.1',
    defaultMessage: 'Enter the email address to send your template to.',
  },
  modalBody2: {
    id: 'email.campaign.sendTest.modal.body.2',
    defaultMessage: 'Your email will be sent from support@mediarithmics.com with the following subject Mediarithmics - Test',
  },
  inputPlaceholder: {
    id: 'email.campaign.sendTest.modal.input.placeholder',
    defaultMessage: 'Email address',
  },
  inputError: {
    id: 'email.campaign.sendTest.modal.input.error',
    defaultMessage: 'Please enter an valid email address',
  },
  notifSuccessTitle: {
    id: 'email.campaign.sendTest.notif.success.title',
    defaultMessage: 'Success',
  },
  notifSuccessContent: {
    id: 'email.campaign.sendTest.notif.success.content',
    defaultMessage: 'The test email has been successfully sent!',
  },
});

export interface EmailTestModalProps {
  isModalVisible: boolean;
  organisationId: string;
  selectedtemplateId: string;
  handleCancel: () => void;
  notifyError: (e: any) => void;
  notifySuccess: (e: ArgsProps) => void;
 }

interface EmailTestModalState {
  inputValue: string;
  isLoading: boolean;
  error: boolean;
}

class EmailTestModal extends React.Component<EmailTestModalProps & InjectedIntlProps, EmailTestModalState> {

  constructor(props: EmailTestModalProps & InjectedIntlProps) {
    super(props);
    this.state = {
      inputValue: '',
      isLoading: false,
      error: false,
    };
  }

  handleOk = () => {
    const {
      intl: {
        formatMessage,
      },
    } = this.props;
    if (this.state.inputValue && this.state.inputValue.length) {
      return this.setState({ isLoading: true }, () => {
        CreativeService.sendTestBlast(this.props.selectedtemplateId, this.props.organisationId, this.state.inputValue).then(() => {
          return this.setState({ isLoading: false }, () => {
            this.props.notifySuccess({
              message: formatMessage(messages.notifSuccessTitle),
              description: formatMessage(messages.notifSuccessContent),
            });
            this.props.handleCancel();
          });
        }).catch((e: any) => {
          this.props.notifyError(e);
          this.setState({ isLoading: false });
        });
      });
    }
    this.setState({ error: true });
  }

  render() {
    const {
      intl: {
        formatMessage,
      },
    } = this.props;
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => { this.setState({ inputValue: e.target.value }); };

    return (
      <Modal
        title={formatMessage(messages.modalTitle)}
        visible={this.props.isModalVisible}
        onOk={this.handleOk}
        onCancel={this.props.handleCancel}
        confirmLoading={this.state.isLoading}
      >
        <p>{formatMessage(messages.modalBody1)}</p>
        <p>{formatMessage(messages.modalBody2)}</p>
        <br/>
        {this.state.error ? <Alert message={formatMessage(messages.inputError)} type="error" /> : null}

        <Input onChange={onChange} defaultValue="" placeholder={formatMessage(messages.inputPlaceholder)} />

      </Modal>
    );
  }
}

export default compose(
  injectIntl,
  connect(undefined, { notifyError: actions.notifyError, notifySuccess: actions.notifySuccess }),
)(EmailTestModal);
