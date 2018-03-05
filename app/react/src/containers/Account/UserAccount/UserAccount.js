import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';
import { Form, Button } from 'antd';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';

import {
  FormInput,
} from '../../../components/Form/index.ts';
import * as AccountActions from '../../../state/Account/actions';

class UserAccount extends Component {

  buildSaveActionElement() {
    return (<Button key="SAVE" type="primary" htmlType="submit">
      <FormattedMessage id="SAVE" defaultMessage="Save" />
    </Button>);
  }

  render() {
    const {
      handleSubmit,
      updateUserProfile,
      intl: { formatMessage },
    } = this.props;

    const saveButton = this.buildSaveActionElement();
    const buttons = [saveButton];

    const formMessages = defineMessages({
      firstnameInputLabel: { id: 'FirstName', defaultMessage: 'First Name' },
      firstnameInputPlaceholder: { id: 'FirstNamePlaceHolder', defaultMessage: 'First name' },
      lastnameInputLabel: { id: 'LastName', defaultMessage: 'Last Name' },
      lastnameInputPlaceholder: { id: 'LastNamePlaceHolder', defaultMessage: 'Last name' },
      emailInputLabel: { id: 'Email', defaultMessage: 'Email' },
      emailInputPlaceholder: { id: 'EmailPlaceHolder', defaultMessage: 'Email' },
    });

    const invalidMessages = defineMessages({
      invalidEmail: { id: 'account.invalid_email', defaultMessage: 'Invalid email address' },
      requiredField: { id: 'account.required_field', defaultMessage: 'Required' },
    });

    const isRequired = value => (value ? undefined : formatMessage(invalidMessages.requiredField));

    const emailValidation = value => {
      return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
        formatMessage(invalidMessages.invalidEmail) : undefined;
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
      },
      {
        fieldName: 'last_name',
        label: formMessages.lastnameInputLabel,
        placeholder: formMessages.lastnameInputPlaceholder,
        invalidCallback: isRequired,
      },
      {
        fieldName: 'email',
        label: formMessages.emailInputLabel,
        placeholder: formMessages.emailInputPlaceholder,
        invalidCallback: emailValidation,
      },
    ];

    return (<Form onSubmit={handleSubmit(updateUserProfile)}>
      <div className="mcs-card-header mcs-card-title">
        <span className="mcs-card-title">
          <FormattedMessage id="UserProfile" defaultMessage="User Profile" />
        </span>
        <span className="mcs-card-button">{buttons}</span>
      </div>
      <hr className="mcs-separator" />
      {userFields.map((userField) => {
        return (<Field
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
            },
          }}
        />);
      })
      }
    </Form>);
  }
}

UserAccount.propTypes = {
  updateUserProfile: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => ({
  initialValues: state.session.connectedUser,
});

const mapDispatchToProps = {
  updateUserProfile: AccountActions.saveProfile.request,
};

UserAccount = compose(
  reduxForm({
    form: 'userAccountEdit',
  }),
  injectIntl,
)(UserAccount);

UserAccount = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserAccount);

export default UserAccount;
