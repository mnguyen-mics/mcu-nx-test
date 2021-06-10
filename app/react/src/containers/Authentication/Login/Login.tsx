import { connect } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { ActionFunctionAny, ActionMeta } from 'redux-actions';
import { compose } from 'recompose';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { Input, Button, Form, Alert, Switch, Divider } from 'antd';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import log from '../../../utils/Logger';
import { logIn } from '../../../redux/Login/actions';
import { Credentials } from '../../../services/AuthService';
import { UserProfileResource } from '../../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import LocalStorage from '../../../services/LocalStorage';
import { StaticContext } from 'react-router';
import { LocationDescriptorObject } from 'history';

const FormItem = Form.Item;

const messages = defineMessages({
  logInError: {
    id: 'authentication.login.login.error',
    defaultMessage:
      'There was an error with the information you entered, please check your username / password.',
  },
  expiredPassword: {
    id: 'authentication.login.expired.password',
    defaultMessage:
      'Your password has expired. Please create a new one by clicking on Forgot password.',
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

interface MapStateToProps {
  hasError: boolean;
  error: {
    [key: string]: string;
  };
  connectedUser: UserProfileResource;
}

// see https://redux-actions.js.org/api/createaction
// for payloadCreator and metaCreator definitions
interface MapDispatchToProps {
  logInRequest: (
    payloadCreator: Credentials & { remember: boolean },
    metaCreator: { redirect: () => void },
  ) => ActionFunctionAny<ActionMeta<any, any>>;
}

type Props = MapStateToProps &
  MapDispatchToProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{}, StaticContext, { from?: string }>;

const Login = (props: Props) => {
  const getRememberMe = () => {
    const rememberMe = LocalStorage.getItem('remember_me');
    return rememberMe === 'true';
  };
  const [isRequesting, setIsRequesting] = useState(false);
  const [isChecked, setCheck] = useState(getRememberMe());
  const [form] = Form.useForm();

  useEffect(() => {
    let loggedIn = false;
    window.addEventListener('storage', (e: StorageEvent) => {
      const loginEvent =
        e.storageArea && e.storageArea.isLogged && e.storageArea.isLogged === 'true';
      if (!!loginEvent && !loggedIn) {
        handleSubmit(e);
        loggedIn = true;
      }
    });
  }, []);

  const handleSubmit = (e: any) => {
    const defaultRedirect: LocationDescriptorObject = { pathname: '/' };
    const from = (props.location.state && props.location.state.from) || defaultRedirect;
    const { match } = props;
    const redirect = () => {
      log.debug(`Redirect from ${match.url} to ${from}`);
      props.history.push('/');
    };

    form.validateFields().then(values => {
      setIsRequesting(true);
      props.logInRequest(
        {
          email: values.email,
          password: values.password,
          remember: isChecked,
        },
        { redirect },
      );
      // logInRequest is not a Promise so
      // there is no.then() and no .catch()
    });
  };

  const onSwitchChange = (checked: boolean, event: MouseEvent) => {
    setCheck(checked);
  };

  const { hasError, error, intl, connectedUser } = props;

  const hasFetchedConnectedUser = connectedUser && connectedUser.id;

  const errorMsg = hasError ? (
    error && error.error_code === 'EXPIRED_PASSWORD_ERROR' ? (
      <Alert
        type='error'
        className='login-error-message'
        message={<FormattedMessage {...messages.expiredPassword} />}
      />
    ) : (
      <Alert
        type='error'
        className='login-error-message'
        message={<FormattedMessage {...messages.logInError} />}
      />
    )
  ) : null;

  return (
    <div className='mcs-login-container'>
      <div className='mcs-login-container-left'>
        <div className='image-wrapper'>
          <img alt='mics-logo' className='login-logo' src={'/react/src/assets/images/logo.png'} />
        </div>
        <div className='login-frame'>
          <Form onFinish={handleSubmit} form={form}>
            {errorMsg}
            <div className='login-password-text'>
              <FormattedMessage {...messages.emailText} />
            </div>
            <FormItem
              name='email'
              rules={[{ required: true, message: intl.formatMessage(messages.emailRequired) }]}
            >
              <Input className='login-input' />
            </FormItem>
            <div className='login-password-text'>
              <FormattedMessage {...messages.passwordText} />
            </div>
            <FormItem
              name='password'
              rules={[{ required: true, message: intl.formatMessage(messages.passwordRequired) }]}
            >
              <Input type='password' className='login-input' autoComplete='off' />
            </FormItem>
            <FormItem>
              <Button
                type='primary'
                htmlType='submit'
                className='mcs-primary login-form-button'
                loading={isRequesting && !hasFetchedConnectedUser && !hasError}
              >
                <FormattedMessage {...messages.logInText} />
              </Button>
            </FormItem>
            <Divider />
            <FormItem name='remember' initialValue={getRememberMe()}>
              <Switch size='small' checked={isChecked} onChange={onSwitchChange} />
              <div className='login-text-remember-me'>
                <FormattedMessage {...messages.rememberMe} />
              </div>
              <Link className='login-form-forgot' to='/v2/forgot_password'>
                <FormattedMessage {...messages.forgotPassword} />
              </Link>
            </FormItem>
          </Form>
        </div>
      </div>
      <div className='mcs-login-container-right' />
    </div>
  );
};

const mapStateToProps = (state: MicsReduxState) => ({
  hasError: state.login.hasError,
  error: state.login.error,
  connectedUser: state.session.connectedUser,
});

const mapDispatchToProps = {
  logInRequest: logIn.request,
};

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Login);
