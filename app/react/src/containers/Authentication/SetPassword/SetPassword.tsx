// Deprecated -> For further dev, use ChangePassword component
import * as React from 'react';
import { Input, Button, Alert, Row, Col } from 'antd';
import { Form } from '@ant-design/compatible';
import FormItem from 'antd/lib/form/FormItem';
import { injectIntl, WrappedComponentProps, FormattedMessage, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { SET_PASSWORD_SEARCH_SETTINGS, parseSearch } from '../../../utils/LocationSearchHelper';
import { defaultErrorMessages } from '../../../components/Form/withValidators';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IAuthService } from '@mediarithmics-private/advanced-components';

type Props = WrappedComponentProps & FormComponentProps & RouteComponentProps<{}>;

interface State {
  isRequesting: boolean;
  isError: boolean;
  errorMessage: string;
}

const messages = defineMessages({
  setPassword: {
    id: 'authentication.setPassword.reset',
    defaultMessage: 'Reset Your Password',
  },
  revertologin: {
    id: 'authentication.setPassword.goBackTologin',
    defaultMessage: 'Go Back To Login',
  },
  passwordFormTitle: {
    id: 'authentication.setPassword.formTitle',
    defaultMessage: 'PASSWORD',
  },
  standardSetPasswordError: {
    id: 'authentication.setPassword.errorMessage',
    defaultMessage:
      'Please make sure that the two passwords match and that your password is at least 8 characters long.',
  },
});

class SetPassword extends React.Component<Props, State> {
  @lazyInject(TYPES.IAuthService)
  private _authService: IAuthService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isRequesting: false,
      isError: false,
      errorMessage: '',
    };
  }

  handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    const {
      location: { search },
      history,
    } = this.props;
    const filter = parseSearch(search, SET_PASSWORD_SEARCH_SETTINGS);

    e.preventDefault();
    this.setState({ isError: false });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.checkPasswordValidity(values.password1, values.password2)) {
          // validate
          this._authService
            .resetPassword(filter.email, filter.token, values.password1)
            .then(() => {
              history.push('/login');
            })
            .catch((errBack: any) => {
              this.setState({ isError: true, errorMessage: errBack.error });
            });
        } else {
          this.setState({ isError: true, errorMessage: '' });
        }
      }
    });
  };

  // checkPasswordValidity to be updated when new routes are created
  checkPasswordValidity = (password1: string, password2: string) => {
    if (password1 !== password2) {
      return false;
    } else if (password1.length < 8) {
      return false;
    }
    return true;
  };

  render() {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;

    const { isError } = this.state;

    const errorMsg = isError ? (
      <Alert
        type='error'
        style={{ marginBottom: 24 }}
        message={
          this.state.errorMessage === '' ? (
            <FormattedMessage {...messages.standardSetPasswordError} />
          ) : (
            this.state.errorMessage
          )
        }
        className='login-error-message'
      />
    ) : null;

    return (
      <div className='mcs-reset-password-container'>
        <div className='image-wrapper'>
          <img
            alt='mics-logo'
            className='reset-password-logo'
            src={'/react/src/assets/images/logo.png'}
          />
        </div>
        <div className='reset-password-title'>
          <FormattedMessage {...messages.setPassword} />
        </div>
        <div className='reset-password-container-frame mcs-legacy_form_container'>
          <Form onSubmit={this.handleSubmit} className='login-form'>
            {errorMsg}
            <div className='password-text'>
              <FormattedMessage {...messages.passwordFormTitle} />
            </div>
            {
              <FormItem>
                {getFieldDecorator('password1', {
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage(defaultErrorMessages.required),
                    },
                  ],
                })(<Input type='password' className='reset-password-input' autoComplete='off' />)}
              </FormItem>
            }
            <div className='password-text'>
              <FormattedMessage {...messages.passwordFormTitle} />
            </div>
            <FormItem>
              {getFieldDecorator('password2', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage(defaultErrorMessages.required),
                  },
                ],
              })(<Input type='password' className='reset-password-input' autoComplete='off' />)}
            </FormItem>
            <Row
              //  type="flex"
              align='middle'
              justify='center'
            >
              <Col span={12} className='reset-password-back-to-login'>
                <Link to={'/login'}>
                  <FormattedMessage {...messages.revertologin} />
                </Link>
              </Col>
              <Col span={12}>
                <Button
                  type='primary'
                  htmlType='submit'
                  className='mcs-primary reset-password-button'
                >
                  <FormattedMessage {...messages.setPassword} />
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(compose<Props, {}>(withRouter, injectIntl)(SetPassword));
