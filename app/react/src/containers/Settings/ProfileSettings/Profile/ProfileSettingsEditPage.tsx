import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';
import { LoadingOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import { Button, Layout } from 'antd';
import { injectIntl, FormattedMessage, defineMessages, InjectedIntlProps } from 'react-intl';
import * as SessionActions from '../../../../redux/Session/actions';

import { FormInput } from '../../../../components/Form';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserResource from '../../../../models/directory/UserResource';
import { lazyInject } from '../../../../config/inversify.config';
import { ISettingsService } from '../../../../services/SettingsService';
import { TYPES } from '../../../../constants/types';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

const { Content } = Layout;
export interface ProfileSettingsEditPageProps {
  refreshConnectedUser: () => void;
}

const messages = defineMessages({
  sucessMessage: {
    id: 'profile.notification.update.success.message',
    defaultMessage: 'Your profile has been successfully updated',
  },
  sucessTitle: {
    id: 'profile.notification.update.success.title',
    defaultMessage: 'Success!',
  },
});

interface ProfileSettingsPageState {
  loading: boolean;
}

interface UserProfileProps {
  first_name: string;
  last_name: string;
  email: string;
}

type Props = ProfileSettingsEditPageProps &
  InjectedFormProps<UserProfileProps> &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class ProfileSettingsEditPage extends React.Component<Props, ProfileSettingsPageState> {
  @lazyInject(TYPES.ISettingsService)
  private _settingsService: ISettingsService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  buildSaveActionElement() {
    const { dirty, valid } = this.props;
    return (
      <Button key='SAVE' type='primary' htmlType='submit' disabled={!(dirty && valid)}>
        <FormattedMessage id='settings.profile.edit.save' defaultMessage='Save' />{' '}
        {this.state.loading ? <LoadingOutlined /> : null}
      </Button>
    );
  }

  updateUserProfile = (e: UserResource) => {
    const {
      match: {
        params: { organisationId },
      },
      refreshConnectedUser,
      notifyError,
      notifySuccess,
      intl,
    } = this.props;

    this.setState({ loading: true });
    this._settingsService
      .putProfile(organisationId, e)
      .then(res => {
        refreshConnectedUser();
        notifySuccess({
          uid: Math.random(),
          message: intl.formatMessage(messages.sucessTitle),
          description: intl.formatMessage(messages.sucessMessage),
        });
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
        notifyError(err);
      });
  };

  render() {
    const {
      handleSubmit,
      intl: { formatMessage },
    } = this.props;

    const saveButton = this.buildSaveActionElement();
    const buttons = [saveButton];

    const formMessages = defineMessages({
      firstnameInputLabel: { id: 'FirstName', defaultMessage: 'First Name' },
      firstnameInputPlaceholder: {
        id: 'FirstNamePlaceHolder',
        defaultMessage: 'First name',
      },
      lastnameInputLabel: { id: 'LastName', defaultMessage: 'Last Name' },
      lastnameInputPlaceholder: {
        id: 'LastNamePlaceHolder',
        defaultMessage: 'Last name',
      },
      emailInputLabel: { id: 'Email', defaultMessage: 'Email' },
      emailInputPlaceholder: {
        id: 'EmailPlaceHolder',
        defaultMessage: 'Email',
      },
    });

    const invalidMessages = defineMessages({
      invalidEmail: {
        id: 'account.invalid_email',
        defaultMessage: 'Invalid email address',
      },
      requiredField: {
        id: 'account.required_field',
        defaultMessage: 'Required',
      },
    });

    const isRequired = (value?: string) =>
      value ? undefined : formatMessage(invalidMessages.requiredField);

    const emailValidation = (value?: string) => {
      return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
        ? formatMessage(invalidMessages.invalidEmail)
        : undefined;
    };

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    const userFields = [
      {
        fieldName: 'first_name',
        label: formMessages.firstnameInputLabel,
        placeholder: formMessages.firstnameInputPlaceholder,
        invalidCallback: isRequired,
        disabled: this.state.loading,
      },
      {
        fieldName: 'last_name',
        label: formMessages.lastnameInputLabel,
        placeholder: formMessages.lastnameInputPlaceholder,
        invalidCallback: isRequired,
        disabled: this.state.loading,
      },
      {
        fieldName: 'email',
        label: formMessages.emailInputLabel,
        placeholder: formMessages.emailInputPlaceholder,
        invalidCallback: emailValidation,
        disabled: true,
      },
    ];

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Form onSubmit={handleSubmit(this.updateUserProfile)} className={'edit-top'}>
            <div className='mcs-card-header mcs-card-title'>
              <span className='mcs-card-title'>
                <FormattedMessage
                  id='settings.profile.edit.userProfile'
                  defaultMessage='User Profile'
                />
              </span>
              <span className='mcs-card-button'>{buttons}</span>
            </div>
            <hr className='mcs-separator' />
            {userFields.map(userField => {
              return (
                <Field
                  key={userField.fieldName}
                  name={userField.fieldName}
                  component={FormInput}
                  validate={[userField.invalidCallback]}
                  // @ts-ignore
                  props={{
                    formItemProps: {
                      label: formatMessage(userField.label),
                      required: true,
                      ...fieldGridConfig,
                    },
                    inputProps: {
                      placeholder: formatMessage(userField.placeholder),
                      disabled: !!userField.disabled,
                    },
                  }}
                />
              );
            })}
          </Form>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  initialValues: state.session.connectedUser,
});

const mapDispatchToProps = {
  refreshConnectedUser: SessionActions.getConnectedUser.request,
};

export default compose(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: 'userAccountEdit',
  }),
)(ProfileSettingsEditPage);
