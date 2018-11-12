import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';
import { Form, Button, Icon, Layout } from 'antd';
import {
  injectIntl,
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
} from 'react-intl';
import SettingsService from '../../../../services/SettingsService';
import * as SessionActions from '../../../../state/Session/actions';

import { FormInput } from '../../../../components/Form/';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserResource from '../../../../models/directory/UserResource';

const { Content } = Layout;
export interface ProfileSettingsPageProps {
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

type Props = ProfileSettingsPageProps &
  InjectedFormProps<UserProfileProps> &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class ProfileSettingsPage extends React.Component<
  Props,
  ProfileSettingsPageState
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  buildSaveActionElement() {
    const { dirty, valid } = this.props;
    return (
      <Button
        key="SAVE"
        type="primary"
        htmlType="submit"
        disabled={!(dirty && valid)}
      >
        <FormattedMessage id="SAVE" defaultMessage="Save" />{' '}
        {this.state.loading ? <Icon type="loading" /> : null}
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
    SettingsService.putProfile(organisationId, e)
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
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Form
            onSubmit={handleSubmit(this.updateUserProfile)}
            className={'edit-top'}
          >
            <div className="mcs-card-header mcs-card-title">
              <span className="mcs-card-title">
                <FormattedMessage
                  id="UserProfile"
                  defaultMessage="User Profile"
                />
              </span>
              <span className="mcs-card-button">{buttons}</span>
            </div>
            <hr className="mcs-separator" />
            {userFields.map(userField => {
              return (
                <Field
                  key={userField.fieldName}
                  name={userField.fieldName}
                  component={FormInput}
                  validate={[userField.invalidCallback]}
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

const mapStateToProps = (state: any) => ({
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
)(ProfileSettingsPage);
