import * as React from 'react';
import { Row, Col, Input, Button, Alert, Spin } from 'antd';
import { Form } from '@ant-design/compatible';
import FormItem from 'antd/lib/form/FormItem';
import { injectIntl, WrappedComponentProps, FormattedMessage, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { SET_PASSWORD_SEARCH_SETTINGS, parseSearch } from '../../../utils/LocationSearchHelper';
import { defaultErrorMessages } from '../../../components/Form/withValidators';
import { PasswordRequirementResource, PasswordValidityResource } from '../../../models/communities';
import PasswReqChecker from '../Helpers/PasswReqChecker';
import { takeLatest } from '../../../utils/ApiHelper';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { ICommunityService } from '../../../services/CommunityServices';
import { IAuthService } from '@mediarithmics-private/advanced-components';

type Props = WrappedComponentProps &
  FormComponentProps &
  RouteComponentProps<{ communityToken: string }>;

interface State {
  fetchingPasswReq: boolean;
  fetchingPasswReqFailure: boolean;
  isError: boolean;
  errorMessage?: string;
  passReq?: PasswordRequirementResource;
  passVal?: PasswordValidityResource;
}

const messages = defineMessages({
  changePassword: {
    id: 'change.password.change.password',
    defaultMessage: 'Change your password',
  },
  setPassword: {
    id: 'change.password.set.password',
    defaultMessage: 'Set your password',
  },
  revertTologin: {
    id: 'change.password.revert.to.login',
    defaultMessage: 'Go back to login',
  },
  passwordFormTitle: {
    id: 'change.password.form.title',
    defaultMessage: 'Password',
  },
  secondPasswordFormTitle: {
    id: 'change.password.second.password.form.title',
    defaultMessage: 'Confirm your password',
  },
  passwordRequirementError: {
    id: 'change.password.requirement.error',
    defaultMessage: 'Your passwords do not match the requirements',
  },
  standardChangePasswordError: {
    id: 'change.password.password.error',
    defaultMessage: 'Your password could not be set, please try again later.',
  },
});

class CommunityChangePassword extends React.Component<Props, State> {
  @lazyInject(TYPES.ICommunityService)
  private _communityService: ICommunityService;

  @lazyInject(TYPES.IAuthService)
  private _authService: IAuthService;

  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingPasswReq: true,
      fetchingPasswReqFailure: false,
      isError: false,
    };
  }

  requestValidity = (handler: any) => {
    const getLatestValidityCall = takeLatest(this._communityService.getCommunityPasswordValidity);

    getLatestValidityCall(this.props.match.params.communityToken, handler.target.value)
      .then(response => {
        this.setState({ passVal: response.data });
      })
      .catch(() =>
        this.setState({
          isError: true,
          errorMessage: messages.standardChangePasswordError.defaultMessage,
        }),
      );
  };

  componentDidMount() {
    this._communityService
      .getCommunityPasswordRequirements(this.props.match.params.communityToken)
      .then(response => {
        this.setState({
          passReq: response.data,
          fetchingPasswReq: false,
          fetchingPasswReqFailure: false,
        });
      })
      .catch(e => {
        this.setState({
          isError: true,
          fetchingPasswReqFailure: true,
          errorMessage: messages.standardChangePasswordError.defaultMessage,
          fetchingPasswReq: false,
        });
      });
  }

  passwordValidity(val?: PasswordValidityResource, p1?: string, p2?: string) {
    return val && !Object.values(val).includes(false) && p1 && p2 && p1 === p2;
  }

  handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    const {
      location: { search },
      history,
    } = this.props;
    const filter = parseSearch(search, SET_PASSWORD_SEARCH_SETTINGS);

    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (
        !err &&
        !this.state.fetchingPasswReqFailure &&
        this.passwordValidity(this.state.passVal, values.password1, values.password2)
      ) {
        // validate
        this._authService
          .resetPassword(filter.email, filter.token, values.password1)
          .then(() => {
            history.push('/login');
          })
          .catch((errBack: any) => {
            this.setState({
              isError: true,
              errorMessage: errBack.error,
            });
          });
      } else {
        this.setState({
          isError: true,
          errorMessage: messages.passwordRequirementError.defaultMessage,
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;

    const { isError, errorMessage, fetchingPasswReq, passReq, passVal } = this.state;
    const errorMsg =
      isError && errorMessage ? (
        <Alert
          type='error'
          className='login-error-message'
          style={{ marginBottom: 15, paddingLeft: 5 }}
          message={errorMessage}
        />
      ) : null;

    const pageType = this.props.location.pathname.includes('/change-password') ? (
      <FormattedMessage {...messages.changePassword} />
    ) : (
      <FormattedMessage {...messages.setPassword} />
    );

    const p1 = this.props.form.getFieldValue('password1');
    const p2 = this.props.form.getFieldValue('password2');

    return (
      <div className='mcs-reset-password-container'>
        <div className='image-wrapper'>
          <img
            alt='mics-logo'
            className='reset-password-logo'
            src={'/react/src/assets/images/logo.png'}
          />
        </div>
        <div className='reset-password-title'>{pageType}</div>
        <div className='reset-password-container-frame mcs-legacy_form_container'>
          {fetchingPasswReq && <Spin size='large' />}
          {!fetchingPasswReq && !passReq && (
            <div>
              {errorMsg}
              <Row align='middle' justify='center'>
                <Col span={24}>
                  <Button type='ghost' className='reset-password-button' href='/'>
                    <FormattedMessage {...messages.revertTologin} />
                  </Button>
                </Col>
              </Row>
            </div>
          )}
          {!fetchingPasswReq && passReq !== undefined && (
            <Form onSubmit={this.handleSubmit} className='login-form'>
              {errorMsg}
              <div className='reset-password-requirements'>
                <PasswReqChecker req={passReq} val={passVal} p1={p1} p2={p2} />
              </div>
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
                  })(
                    <Input
                      type='password'
                      className='reset-password-input'
                      onChange={this.requestValidity}
                      autoComplete='off'
                    />,
                  )}
                </FormItem>
              }
              <div className='password-text'>
                <FormattedMessage {...messages.secondPasswordFormTitle} />
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
              <Row align='middle' justify='center'>
                <Col span={12}>
                  <Button type='ghost' className='reset-password-button' href='/'>
                    <FormattedMessage {...messages.revertTologin} />
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type='primary'
                    htmlType='submit'
                    className='mcs-primary reset-password-button'
                    disabled={!this.passwordValidity(passVal, p1, p2)}
                  >
                    {pageType}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </div>
    );
  }
}

export default Form.create()(compose<Props, {}>(withRouter, injectIntl)(CommunityChangePassword));
