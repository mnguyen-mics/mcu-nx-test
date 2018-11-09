import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Form, Input, Button, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import messages from './messages';
import AuthService from '../../../services/AuthService';

const logoUrl = require('../../../assets/images/logo.png');
const FormItem = Form.Item;

interface ForgotPasswordProps {}

interface State {
  hasError: boolean,
  isRequesting: boolean,
  passwordSentSuccess: boolean
}

type Props = ForgotPasswordProps & InjectedIntlProps & FormComponentProps

class ForgotPassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isRequesting: false,
      passwordSentSuccess: false,
    }
  }

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ isRequesting: true })
        AuthService
          .sendPassword(values.email)
          .then(() => {
            this.setState({ passwordSentSuccess: true, isRequesting: false })
          })
          .catch(() => {
            this.setState({ hasError: true, isRequesting: false})
          });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },      
      intl: { formatMessage },
    } = this.props;

    const { isRequesting, hasError, passwordSentSuccess } = this.state;

    const hasFieldError = this.props.form.getFieldError('email');
    const errorMsg =
      !hasFieldError && hasError ? (
        <Alert
          type="error"
          className="login-error-message"
          style={{ marginBottom: 24 }}
          message={<FormattedMessage {...messages.resetPasswordWrong} />}
        />
      ) : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="image-wrapper">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
        </div>
        <div className="reset-password-title">
          <FormattedMessage {...messages.resetPasswordTitle} />
        </div>
        <div className="reset-password-container-frame">
          {!passwordSentSuccess && (
            <Form onSubmit={this.handleSubmit} className="reset-password-form">
              {errorMsg}
              <div className="reset-passwork-msg">
                <FormattedMessage {...messages.resetPasswordDescription} />
              </div>
              <div className="password-text">
                <FormattedMessage {...messages.emailText} />
              </div>
              <FormItem>
                {getFieldDecorator('email', {
                  rules: [
                    {
                      type: 'email',
                      required: true,
                      message: formatMessage(
                        messages.resetPasswordEmailRequired,
                      ),
                    },
                  ],
                })(<Input className="reset-password-input" />)}
              </FormItem>
              <div className="two-buttons">
                <Link to="/login" className="reset-password-button">
                  <FormattedMessage {...messages.resetPasswordBack} />
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="mcs-primary reset-password-button"
                  loading={isRequesting}
                >
                  <FormattedMessage {...messages.resetPasswordSubmit} />
                </Button>
              </div>
            </Form>
          )}
          {passwordSentSuccess && (
            <div>
              <div>
                <p className="reset-password-messages">
                  <FormattedMessage {...messages.resetPasswordPasswordSent} />
                </p>
                <p className="reset-password-messages">
                  <FormattedMessage {...messages.resetPasswordEmailSpan} />
                </p>
              </div>
              <Button
                type="primary"
                htmlType="button"
                className="mcs-primary reset-password-button-whole"
              >
                <Link to="/login">
                  <FormattedMessage {...messages.resetPasswordReturnToLogin} />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  } 
}

export default compose(
  injectIntl,
  Form.create(),
)(ForgotPassword);
