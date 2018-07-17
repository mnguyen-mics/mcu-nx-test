import * as React from 'react';
import { Form, Input, Icon, Button, Alert } from 'antd';
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
import { SET_PASSWORD_SEARCH_SETTINGS, parseSearch } from '../../../utils/LocationSearchHelper';
import AuthService from '../../../services/AuthService';
export interface SetPasswordProps {}

type Props = SetPasswordProps & InjectedIntlProps & FormComponentProps & RouteComponentProps<{}>;

interface State {
  isRequesting: boolean;
  isError: boolean;
}

const messages = defineMessages({
  error: {
    id: 'reset.set.password.error',
    defaultMessage:
      'Please make sure that the two passwords matches and that your password is at least 8 characters long.',
  },
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
    const { location: { search }, history}  = this.props;
    const filter = parseSearch(search, SET_PASSWORD_SEARCH_SETTINGS);

    e.preventDefault();
    this.setState({ isError: false });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.checkPasswordValidity(values.password1, values.password2)) {
          // validate
          AuthService.resetPassword(filter.email, filter.token, values.password1)
            .then(() => {
              history.push('/login')
            }).catch(() => {
              this.setState({isError: true})
            })
        } else {
          this.setState({ isError: true });
        }
      }
    });
  };

  checkPasswordValidity = (password1: string, password2: string) => {
    if (password1 !== password2) {
      return false;
    } else if (password1.length < 8) {
      return false;
    }
    return true;
  };

  public render() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    const { isError } = this.state;

    const errorMsg = isError ? (
      <Alert
        type="error"
        style={{ marginBottom: 24 }}
        message={<FormattedMessage {...messages.error} />}
      />
    ) : null;

    return (
      <div className="mcs-login-container">
        <div className="login-frame">
          <Form onSubmit={this.handleSubmit} className="login-form">
            <div className="image-wrapper">
              <img
                alt="mics-logo"
                className="login-logo"
                src={'../../../assets/images/logo.png'}
              />
            </div>
            {errorMsg}
            <FormItem>
              {getFieldDecorator('password1', {
                rules: [{ required: true, message: 'Password' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                  type="password"
                  placeholder={'Password'}
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password2', {
                rules: [{ required: true, message: 'test' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                  type="password"
                  placeholder={'Password'}
                />,
              )}
            </FormItem>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              <FormattedMessage {...messages.setPassword} />
            </Button>
            <div style={{ width: '100%', marginTop: 20, textAlign: 'center' }}>
              <Link to={'/login'}>
                <FormattedMessage {...messages.revertologin} />
              </Link>
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
