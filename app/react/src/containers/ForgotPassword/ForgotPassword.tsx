import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { sendPassword, passwordForgotReset } from '../../state/ForgotPassword/actions';
import messages from './messages';
import { FormComponentProps } from 'antd/lib/form';

const logoUrl = require('../../assets/images/logo.png');
const FormItem = Form.Item;

interface ForgotPasswordProps {}

interface MapStateToProps { // eslint-disable-line react/forbid-prop-types
  hasError: boolean,
  sendPasswordRequest: (obj: { email: string }) => void,
  passwordForgotReset: () => void,
  isRequesting: boolean,
  passwordSentSuccess: boolean
}

type Props = ForgotPasswordProps & MapStateToProps & InjectedIntlProps & FormComponentProps

class ForgotPassword extends React.Component<Props> {

  componentWillUnmount() {
    this.props.passwordForgotReset();
  }

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.sendPasswordRequest({
          email: values.email,
        });
      }
    });
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
    const errorMsg = !hasFieldError && hasError ? <Alert type="error" style={{ marginBottom: 24 }} message={<FormattedMessage {...messages.resetPasswordTitle} />} /> : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="reset-password-container-frame">
          <div className="image-wrapper">
            <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
          </div>
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
            <Link className="back-to-login" to="/login"><FormattedMessage {...messages.resetPasswordBack} /></Link>
          </div>
          }

        </div>
      </div>
    );

  }

}

const mapStateToProps = (state: any) => ({
  hasError: state.forgotPassword.hasError,
  isRequesting: state.forgotPassword.isRequesting,
  passwordSentSuccess: state.forgotPassword.passwordSentSuccess,
});

const mapDispatchToProps = {
  sendPasswordRequest: sendPassword.request,
  passwordForgotReset: passwordForgotReset,
};
export default compose(
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  Form.create(),
)(ForgotPassword);
