import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Form, Input, Button, Alert } from 'antd';
import logoUrl from '../../../assets/images/logo.png';
import { sendPassword, passwordForgotReset } from '../../../state/ForgotPassword/actions';
import messages from './messages';

const FormItem = Form.Item;

class ForgotPassword extends Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.passwordForgotReset();
  }

  render() {

    const {
      form: {
        getFieldDecorator,
      },
      isRequesting,
      hasError,
      passwordSentSuccess,
      intl: { formatMessage },
    } = this.props;

    const hasFieldError = this.props.form.getFieldError('email');
    const errorMsg = !hasFieldError && hasError ? <Alert type="error" className="login-error-message" style={{ marginBottom: 24 }} message={<FormattedMessage {...messages.resetPasswordWrong} />} /> : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="image-wrapper">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
        </div>
        <div className="reset-password-title">
          <FormattedMessage {...messages.resetPasswordTitle} />
        </div>
        <div className="reset-password-container-frame">
          { !passwordSentSuccess &&
          <Form onSubmit={this.handleSubmit} className="reset-password-form">
            { errorMsg }
            <div className="reset-passwork-msg" >
              <FormattedMessage {...messages.resetPasswordDescription} />
            </div>
            <div className="password-text">
              <FormattedMessage id="EMAIL" />
            </div>
            <FormItem>
              { getFieldDecorator('email', {
                rules: [{ type: 'email', required: true, message: formatMessage(messages.resetPasswordEmailRequired) }],
              })(
                <Input className="reset-password-input" />,
              )}
            </FormItem>
            <div className="two-buttons">
              <Link to="/login" className="reset-password-button"><FormattedMessage {...messages.resetPasswordBack} /></Link>
              <Button type="primary" htmlType="submit" className="mcs-primary reset-password-button" loading={isRequesting}>
                <FormattedMessage {...messages.resetPasswordSubmit} />
              </Button>
            </div>
          </Form>
          }
          { passwordSentSuccess &&
          <div>
            <div>
              <p className="reset-password-messages">
                <FormattedMessage {...messages.resetPasswordPasswordSent} />
              </p>
              <p className="reset-password-messages">
                <FormattedMessage {...messages.resetPasswordEmailSpan} />
              </p>
            </div>
            <Button type="primary" htmlType="button" className="mcs-primary reset-password-button-whole">
              <Link to="/login"><FormattedMessage {...messages.resetPasswordReturnToLogin} /></Link>
            </Button>
          </div>
          }
        </div>
      </div>
    );

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.sendPasswordRequest({
          email: values.email,
        });
      }
    });
  }

}


ForgotPassword.propTypes = {
  form: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasError: PropTypes.bool.isRequired,
  sendPasswordRequest: PropTypes.func.isRequired,
  passwordForgotReset: PropTypes.func.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  passwordSentSuccess: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => ({
  hasError: state.forgotPassword.hasError,
  isRequesting: state.forgotPassword.isRequesting,
  passwordSentSuccess: state.forgotPassword.passwordSentSuccess,
});

const mapDispatchToProps = {
  sendPasswordRequest: sendPassword.request,
  passwordForgotReset: passwordForgotReset,
};

ForgotPassword = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ForgotPassword);

ForgotPassword = Form.create()(ForgotPassword);

ForgotPassword = compose(
  injectIntl,
)(ForgotPassword);


export default ForgotPassword;
