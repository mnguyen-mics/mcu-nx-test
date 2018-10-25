import * as React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';
import { compose } from 'recompose';
import { FormComponentProps } from 'antd/lib/form';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {
  SET_PASSWORD_SEARCH_SETTINGS,
  parseSearch,
} from '../../../utils/LocationSearchHelper';
import AuthService from '../../../services/AuthService';
import { defaultErrorMessages } from '../../../components/Form/withValidators';

// Password requirements are currently hardcoded. But needs to be changed later on.
import { PasswordRequirements } from './PasswordRequirements';

const logoUrl = require('../../../assets/images/logo.png');

export interface SetPasswordProps {}

type Props = SetPasswordProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{}>;

interface State {
  isRequesting: boolean;
  isError: boolean;
}

const printPasswordRequirements = () => {
  return (
    <div className="login-error-message">
      <p>Please make sure that:</p>
      <p>- you typed twice the same passwords</p>
      <p>- they contain at least {PasswordRequirements.min_length } characters long</p>
      <p>- they contain at least {PasswordRequirements.min_digit_count} digit{PasswordRequirements.min_digit_count > 1 ? 's' : '' } </p>
      <p>- they contain at least {PasswordRequirements.min_special_chars_count} special character{PasswordRequirements.min_special_chars_count > 1 ? 's' : '' } </p>
      {PasswordRequirements.different_letter_case_needed === true ? <p>- they contain lowercase and uppercase characters</p> : '' }
    </div>
    );
};

const messages = defineMessages({
  setPassword: {
    id: 'reset.set.password.set.password',
    defaultMessage: 'Reset Your Password',
  },
  revertologin: {
    id: 'reset.set.password.rever.to.login',
    defaultMessage: 'Go Back To Login',
  },
});

class SetPassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isRequesting: false,
      isError: false,
    };
  }

  handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    const {
      location: { search },
      history,
    } = this.props;
    const filter = parseSearch(search, SET_PASSWORD_SEARCH_SETTINGS);

    e.preventDefault();
    this.setState({ isError: false });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.checkPasswordValidity(values.password1, values.password2)) {
          // validate
          AuthService.resetPassword(
            filter.email,
            filter.token,
            values.password1,
          )
            .then(() => {
              history.push('/login');
            })
            .catch(() => {
              this.setState({ isError: true });
            });
        } else {
          this.setState({ isError: true });
        }
      }
    });
  };

  checkPasswordValidity = (password1: string, password2: string) => {
    const upperAndLowerCases = (/[A-Z]/gm).test(password1) && (/[a-z]/gm).test(password1);
    const specialCharsTab = password1.match(/[@#$%^&*()!_+\-=\[\]{};':"\\|,.<>\/?]/g);
    const specialCharsNb = specialCharsTab ? specialCharsTab.length : 0;
    if (password1 == null || password2 === null) {
      return false;
    } if (password1 !== password2) {
      return false;
    } if (password1.length < PasswordRequirements.min_length) {
      return false;
    } if (specialCharsNb < PasswordRequirements.min_special_chars_count) {
      return false;
    } if (!upperAndLowerCases && PasswordRequirements.different_letter_case_needed) {
      return false; }
        return true;
  };

  render() {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;

    const { isError } = this.state;

    const errorMsg = isError ? (
      <Alert
        type="error"
        style={{ marginBottom: 24 }}
        message={printPasswordRequirements()}
        className="login-error-message"
      />
    ) : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="image-wrapper">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
        </div>
        <div className="reset-password-title">
          <FormattedMessage {...messages.setPassword} />
        </div>
        <div className="reset-password-container-frame">
          
          <Form onSubmit={this.handleSubmit} className="login-form">
            {errorMsg}
            <div className="password-text">
              <FormattedMessage id="PASSWORD" />
            </div>
            {<FormItem>
              {getFieldDecorator('password1', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage(defaultErrorMessages.required),
                  },
                ],
              })(
                <Input
                  type="password"
                  className="reset-password-input"
                />,
              )}
            </FormItem>}
            <div className="password-text">
              <FormattedMessage id="PASSWORD" />
            </div>
            <FormItem>
              {getFieldDecorator('password2', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage(defaultErrorMessages.required),
                  },
                ],
              })(
                <Input
                  type="password"
                  className="reset-password-input"
                />,
              )}
            </FormItem>
            <div className="two-buttons">
              <Link to={'/login'} className="reset-password-button">
                <FormattedMessage {...messages.revertologin} />
              </Link>
              <Button type="primary" htmlType="submit" className="mcs-primary reset-password-button">
                <FormattedMessage {...messages.setPassword} />
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  Form.create(),
  injectIntl,
)(SetPassword);
