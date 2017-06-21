import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Form, Icon, Input, Button } from 'antd';
import Alert from 'mcs-react-alert';
import logoUrl from '../../assets/images/logo-mediarithmics.png';
import { sendPassword, passwordForgotReset } from '../../state/ForgotPassword/actions';

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
      translations,
      form: {
        getFieldDecorator
      },
      isRequesting,
      hasError,
      passwordSentSuccess
     } = this.props;

    const hasFieldError = this.props.form.getFieldError('email');
    const errorMsg = !hasFieldError && hasError ? <Alert type="danger" text={<FormattedMessage id="LOG_IN_ERROR" />} /> : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="reset-password-container-frame">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
          { !passwordSentSuccess &&
          <Form onSubmit={this.handleSubmit} className="reset-password-form">
            { errorMsg }
            <div className="reset-passwork-msg" >
              <FormattedMessage id="RESET_PASSWORD" />
            </div>
            <FormItem>
              { getFieldDecorator('email', {
                rules: [{ type: 'email', required: true, message: translations.EMAL_REQUIRED }],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder={translations.EMAIL_PLACEHOLDER} />
            )}
            </FormItem>
            <Button type="primary" htmlType="submit" className="reset-password-button" loading={isRequesting}>
              <FormattedMessage id="RESET_PASSWORD_BUTTON" />
            </Button>
            <Link className="back-to-login" to="/login"><FormattedMessage id="BACK_TO_LOGIN" /></Link>
          </Form>
        }
          { passwordSentSuccess &&
          <div>
            <div>
              <FormattedMessage id="PASSWORD_SENT" />
              <br />
              <FormattedMessage id="EMAIL_SPAM" />
            </div>
            <br />
            <Button type="primary" htmlType="button" className="reset-password-button">
              <Link to="/login"><FormattedMessage id="RETURN_TO_LOGIN" /></Link>
            </Button>
          </div>
        }

        </div>
      </div>
    );

  }

  handleSubmit = () => {

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
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  form: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasError: PropTypes.bool.isRequired,
  sendPasswordRequest: PropTypes.func.isRequired,
  passwordForgotReset: PropTypes.func.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  passwordSentSuccess: PropTypes.bool.isRequired

};

const mapStateToProps = state => ({
  translations: state.translations,
  hasError: state.forgotPassword.hasError,
  isRequesting: state.forgotPassword.isRequesting,
  passwordSentSuccess: state.forgotPassword.passwordSentSuccess
});

const mapDispatchToProps = {
  sendPasswordRequest: sendPassword.request,
  passwordForgotReset: passwordForgotReset
};

ForgotPassword = connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPassword);

ForgotPassword = Form.create()(ForgotPassword);


export default ForgotPassword;
