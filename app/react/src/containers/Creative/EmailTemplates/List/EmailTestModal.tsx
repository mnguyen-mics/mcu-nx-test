import * as React from 'react';
import { Modal, Input, Alert } from 'antd';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { ICreativeService } from '../../../../services/CreativeService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';

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
    defaultMessage:
      'Your email will be sent from support@mediarithmics.com with the following subject Mediarithmics - Test',
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
}

interface EmailTestModalState {
  inputValue: string;
  isLoading: boolean;
  error: boolean;
}

type JoinedProps = EmailTestModalProps & InjectedNotificationProps & InjectedIntlProps;

class EmailTestModal extends React.Component<JoinedProps, EmailTestModalState> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      inputValue: '',
      isLoading: false,
      error: false,
    };
  }

  handleOk = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    if (this.state.inputValue && this.state.inputValue.length) {
      return this.setState({ isLoading: true }, () => {
        this._creativeService
          .sendTestBlast(
            this.props.selectedtemplateId,
            this.props.organisationId,
            this.state.inputValue,
          )
          .then(() => {
            return this.setState({ isLoading: false }, () => {
              this.props.notifySuccess({
                message: formatMessage(messages.notifSuccessTitle),
                description: formatMessage(messages.notifSuccessContent),
              });
              this.props.handleCancel();
            });
          })
          .catch((e: any) => {
            this.props.notifyError(e);
            this.setState({ isLoading: false });
          });
      });
    }
    this.setState({ error: true });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({ inputValue: e.target.value });
    };

    return (
      <div className='mcs-modal_container'>
        <Modal
          title={formatMessage(messages.modalTitle)}
          visible={this.props.isModalVisible}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <p>{formatMessage(messages.modalBody1)}</p>
          <p>{formatMessage(messages.modalBody2)}</p>
          <br />
          {this.state.error ? (
            <Alert message={formatMessage(messages.inputError)} type='error' />
          ) : null}

          <Input
            onChange={onChange}
            defaultValue=''
            placeholder={formatMessage(messages.inputPlaceholder)}
          />
        </Modal>
      </div>
    );
  }
}

export default compose<JoinedProps, EmailTestModalProps>(
  injectIntl,
  injectNotifications,
)(EmailTestModal);
