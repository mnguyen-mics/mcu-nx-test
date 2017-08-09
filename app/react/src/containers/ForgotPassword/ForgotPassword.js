import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Form, Icon, Input, Button } from 'antd';
import Alert from 'mcs-react-alert';
import logoUrl from '../../assets/images/logo-mediarithmics.png';
import { sendPassword, passwordForgotReset } from '../../state/ForgotPassword/actions';
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
    const errorMsg = !hasFieldError && hasError ? <Alert type="danger" text={<FormattedMessage {...messages.resetPasswordTitle} />} /> : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="reset-password-container-frame">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
          { !passwordSentSuccess &&
          <Form onSubmit={this.handleSubmit} className="reset-password-form">
            { errorMsg }
            <div className="reset-passwork-msg" >
              <FormattedMessage {...messages.resetPasswordTitle} />
            </div>
            <FormItem>
              { getFieldDecorator('email', {
                rules: [{ type: 'email', required: true, message: formatMessage(messages.resetPasswordEmailRequired) }],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder={formatMessage(messages.resetPasswordEmail)} />,
            )}
            </FormItem>
            <Button type="primary" htmlType="submit" className="reset-password-button" loading={isRequesting}>
              <FormattedMessage {...messages.resetPasswordSubmit} />
            </Button>
            <Link className="back-to-login" to="/login"><FormattedMessage {...messages.resetPasswordBack} /></Link>
          </Form>
        }
          { passwordSentSuccess &&
          <div>
            <div>
              <FormattedMessage {...messages.resetPasswordPasswordSent} />
              <br />
              <FormattedMessage {...messages.resetPasswordEmailSpan} />
            </div>
            <br />
            <Button type="primary" htmlType="button" className="reset-password-button">;

              <Link to="/login"><FormattedMessage {...messages.resetPasswordReturnToLogin} /></Link>
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
