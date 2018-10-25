import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Form, Input, Button, Alert, Switch, Divider } from 'antd';

import log from '../../../utils/Logger';

import logoUrl from '../../../assets/images/logo.png';

import { logIn } from '../../../state/Login/actions';

const FormItem = Form.Item;

class Login extends Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {

    const {
      translations,
      form: {
        getFieldDecorator,
      },
      isRequesting,
      hasError,
    } = this.props;

    const errorMsg = hasError ? <Alert type="error" className="login-error-message" message={<FormattedMessage id="LOG_IN_ERROR" />} /> : null;

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
                <FormattedMessage id="EMAIL" />
              </div>
              <FormItem>
                {getFieldDecorator('email', {
                  rules: [{ required: true, message: translations.EMAL_REQUIRED }],
                })(
                  <Input className="login-input" />,
                )}
              </FormItem>
              <div className="login-password-text">
                <FormattedMessage id="PASSWORD" />
              </div>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: translations.PASSWORD_REQURED }],
                })(
                  <Input type="password" className="login-input" />,
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="mcs-primary login-form-button" loading={isRequesting}>
                  <FormattedMessage id="LOG_IN" />
                </Button>
              </FormItem>
              <Divider />
              <FormItem>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(
                  <Switch size="small" />
                )}
                <div className="login-text-remember-me">
                  <FormattedMessage id="REMEMBER_ME" className="login-text-remember-me" />
                </div>
                <Link className="login-form-forgot" to="/v2/forgot_password"><FormattedMessage id="FORGOT_PASSWORD" /></Link>
              </FormItem>
            </Form>
          </div>
        </div>
        <div className="mcs-login-container-right" />
      </div>
    );
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    const { match } = this.props;

    const redirect = () => {
      log.debug(`Redirect from ${match.url} to ${from.pathname}`);
      this.props.history.push(from);
    };

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.logInRequest({
          email: values.email,
          password: values.password,
          remember: values.remember,
        }, { redirect });
      }
    });
  }
}

Login.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  form: PropTypes.shape().isRequired,
  hasError: PropTypes.bool.isRequired,
  location: PropTypes.shape().isRequired,
  logInRequest: PropTypes.func.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  history: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasError: state.login.hasError,
  isRequesting: state.login.isRequesting,
});

const mapDispatchToProps = {
  logInRequest: logIn.request,
};

Login = withRouter(Login);

Login = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);

Login = Form.create()(Login);

export default Login;
