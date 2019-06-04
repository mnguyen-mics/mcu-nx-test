import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  InjectedIntlProps,
} from 'react-intl';
import { Form, Input, Button, Alert, Switch, Divider } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import log from '../../../utils/Logger';

import { logIn } from '../../../state/Login/actions';
import { Credentials } from '../../../services/AuthService';
import { UserProfileResource } from '../../../models/directory/UserProfileResource';

const logoUrl = require('../../../assets/images/logo.png');
const FormItem = Form.Item;

const messages = defineMessages({
  logInError: {
    id: 'authentication.login.login.error',
    defaultMessage:
      'There was an error with the information you entered, please check your username / password.',
  },
  forgotPassword: {
    id: 'authentication.login.forgot.password',
    defaultMessage: 'Forgot password',
  },
  passwordText: {
    id: 'authentication.login.password',
    defaultMessage: 'PASSWORD',
  },
  emailText: {
    id: 'authentication.login.email',
    defaultMessage: 'EMAIL',
  },
  logInText: {
    id: 'authentication.login.login.text',
    defaultMessage: 'Log in',
  },
  rememberMe: {
    id: 'authentication.login.remember.me',
    defaultMessage: 'Remember me',
  },
  emailRequired: {
    id: 'authentication.login.email.required',
    defaultMessage: 'Please input your email!',
  },
  passwordRequired: {
    id: 'authentication.login.password.required',
    defaultMessage: 'Please input your password!',
  },
});

interface State {
  isRequesting: boolean;
}

interface MapStateToProps {
  hasError: boolean;
  connectedUser: UserProfileResource;
}

// see https://redux-actions.js.org/api/createaction
// for payloadCreator and metaCreator definitions
interface MapDispatchToProps {
  logInRequest: (
    payloadCreator: Credentials & { remember: boolean },
    metaCreator: { redirect: () => void },
  ) => Promise<void>;
}

type Props = MapStateToProps &
  MapDispatchToProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{}>;

class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isRequesting: false,
    };
  }

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    const { match } = this.props;

    this.setState({
      isRequesting: true,
    });

    const redirect = () => {
      log.debug(`Redirect from ${match.url} to ${from.pathname}`);
      this.props.history.push(from);
    };

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          isRequesting: true,
        });
        this.props
          .logInRequest(
            {
              email: values.email,
              password: values.password,
              remember: values.remember,
            },
            { redirect },
          )
          .then(() => {
            this.setState({
              isRequesting: false,
            });
          })
          .catch(error => {
            this.setState({
              isRequesting: false,
            });
            log.error(error);
          });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      hasError,
      intl,
      connectedUser,
    } = this.props;

    const { isRequesting } = this.state;

    const hasFetchedConnectedUser = connectedUser && connectedUser.id;

    const errorMsg = hasError ? (
      <Alert
        type="error"
        className="login-error-message"
        message={<FormattedMessage {...messages.logInError} />}
      />
    ) : null;

    return (
      <div className="mcs-login-container">
        <div className="mcs-login-container-left">
          <div className="image-wrapper">
            <img alt="mics-logo" className="login-logo" src={logoUrl} />
          </div>
          <div className="login-frame">
            <Form onSubmit={this.handleSubmit}>
              {errorMsg}
              <div className="login-password-text">
                <FormattedMessage {...messages.emailText} />
              </div>
              <FormItem>
                {getFieldDecorator('email', {
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage(messages.emailRequired),
                    },
                  ],
                })(<Input className="login-input" />)}
              </FormItem>
              <div className="login-password-text">
                <FormattedMessage {...messages.passwordText} />
              </div>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage(messages.passwordRequired),
                    },
                  ],
                })(<Input type="password" className="login-input" />)}
              </FormItem>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="mcs-primary login-form-button"
                  loading={isRequesting && !hasFetchedConnectedUser}
                >
                  <FormattedMessage {...messages.logInText} />
                </Button>
              </FormItem>
              <Divider />
              <FormItem>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(<Switch size="small" />)}
                <div className="login-text-remember-me">
                  <FormattedMessage {...messages.rememberMe} />
                </div>
                <Link className="login-form-forgot" to="/v2/forgot_password">
                  <FormattedMessage {...messages.forgotPassword} />
                </Link>
              </FormItem>
            </Form>
          </div>
        </div>
        <div className="mcs-login-container-right" />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  hasError: state.login.hasError,
  connectedUser: state.session.connectedUser,
});

const mapDispatchToProps = {
  logInRequest: logIn.request,
};

export default compose(
  injectIntl,
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  Form.create(),
)(Login);
