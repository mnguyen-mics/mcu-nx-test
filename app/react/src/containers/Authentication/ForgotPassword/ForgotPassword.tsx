import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Form, Input, Button, Alert, Col, Row } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import messages from './messages';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IAuthService } from '../../../services/AuthService';

const logoUrl = require('../../../assets/images/logo.png');
const FormItem = Form.Item;

interface State {
  hasError: boolean;
  isRequesting: boolean;
  passwordSentSuccess: boolean;
}

type Props = InjectedIntlProps & FormComponentProps;

class ForgotPassword extends React.Component<Props, State> {
  @lazyInject(TYPES.IAuthService)
  private _authService: IAuthService;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isRequesting: false,
      passwordSentSuccess: false,
    };
  }

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ isRequesting: true });
        this._authService
          .sendPassword(values.email)
          .then(() => {
            this.setState({ passwordSentSuccess: true, isRequesting: false });
          })
          .catch(() => {
            this.setState({ hasError: true, isRequesting: false });
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
          message={<FormattedMessage {...messages.authenticationError} />}
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
              <Row type="flex" align="middle" justify="center">
                <Col span={12} className="reset-password-back-to-login">
                  <Link to={'/login'}>
                    <FormattedMessage {...messages.resetPasswordBack} />
                  </Link>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mcs-primary reset-password-button"
                    loading={isRequesting}
                  >
                    <FormattedMessage {...messages.resetPasswordSubmit} />
                  </Button>
                </Col>
              </Row>
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
                className="mcs-primary reset-password-button"
                href="/"
              >
                <FormattedMessage {...messages.resetPasswordReturnToLogin} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, Form.create())(ForgotPassword);
