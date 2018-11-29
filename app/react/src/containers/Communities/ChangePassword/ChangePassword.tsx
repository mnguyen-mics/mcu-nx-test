import * as React from 'react';
import { Form, Row, Col, Input, Button, Alert, Spin } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import * as lodash from 'lodash';

import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';

import { compose } from 'recompose';
import { FormComponentProps } from 'antd/lib/form';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  SET_PASSWORD_SEARCH_SETTINGS,
  parseSearch,
} from '../../../utils/LocationSearchHelper';
import AuthService from '../../../services/AuthService';
import { defaultErrorMessages } from '../../../components/Form/withValidators';
import CommunityService from '../../../services/CommunityServices';
import {
  CommunityPasswordRequirement,
  CommunityPasswordValidity,
} from '../../../models/communities';
import PasswReqChecker from '../Helpers/PasswReqChecker';

const logoUrl = require('../../../assets/images/logo.png');

export interface ChangePasswordProps {}

type Props = ChangePasswordProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{ communityToken: string }>;

interface State {
  fetchingPasswReq: boolean;
  fetchingPasswReqFailure: boolean;
  isError: boolean;
  errorMessage?: string;
  passReq?: CommunityPasswordRequirement;
  passVal?: CommunityPasswordValidity;
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
  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingPasswReq: true,
      fetchingPasswReqFailure: false,
      isError: false,
    };
    this.requestValidityDebounced = lodash.debounce(
      this.requestValidityDebounced,
      250,
    );
  }

  persistEvent = (e: any) => {
    e.persist();
    e.preventDefault();
    return e;
  };

  requestValidityDebounced = (handler: any) => {
    handler.persist();
    if (this.state.passReq) {
      CommunityService.getCommunityPasswordValidity(
        this.props.match.params.communityToken,
        handler.target.value,
      ).then(response => {
        this.setState({ passVal: response.data });
      });
    } else {
      this.setState({ isError: true });
    }
  };

  componentDidMount() {
    CommunityService.getCommunityPasswordRequirements(
      this.props.match.params.communityToken,
    )
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

  globalValidity(val?: CommunityPasswordValidity, p1?: string, p2?: string) {
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
        this.globalValidity(
          this.state.passVal,
          values.password1,
          values.password2,
        )
      ) {
        // validate
        AuthService.resetPassword(filter.email, filter.token, values.password1)
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

    const {
      isError,
      errorMessage,
      fetchingPasswReq,
      passReq,
      passVal,
    } = this.state;
    const errorMsg =
      isError && errorMessage ? (
        <Alert
          type="error"
          style={{ marginBottom: 15 }}
          message={errorMessage}
        />
      ) : null;

    const pageType = this.props.location.pathname.includes(
      '/change-password',
    ) ? (
      <FormattedMessage {...messages.changePassword} />
    ) : (
      <FormattedMessage {...messages.setPassword} />
    );

    const p1 = this.props.form.getFieldValue('password1');
    const p2 = this.props.form.getFieldValue('password2');

    return (
      <div className="mcs-reset-password-container">
        <div className="image-wrapper">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
        </div>
        <div className="reset-password-title">{pageType}</div>
        <div className="reset-password-container-frame">
          {fetchingPasswReq && <Spin size="large" />}
          {!fetchingPasswReq && !passReq && (
            <div>
              {errorMsg}
              <Row type="flex" align="middle" justify="center">
                <Col span={24}>
                  <Button
                    type="ghost"
                    className="reset-password-button"
                    href="/"
                  >
                    <FormattedMessage {...messages.revertTologin} />
                  </Button>
                </Col>
              </Row>
            </div>
          )}
          {!fetchingPasswReq && passReq !== undefined && (
            <Form onSubmit={this.handleSubmit} className="login-form">
              {errorMsg}
              <div className="reset-password-requirements">
                <PasswReqChecker req={passReq} val={passVal} p1={p1} p2={p2} />
              </div>
              <div className="password-text">
                <FormattedMessage {...messages.passwordFormTitle} />
              </div>
              {
                <FormItem>
                  {getFieldDecorator('password1', {
                    rules: [
                      {
                        required: true,
                        message: intl.formatMessage(
                          defaultErrorMessages.required,
                        ),
                      },
                    ],
                  })(
                    <Input
                      type="password"
                      className="reset-password-input"
                      onChange={lodash.flowRight(
                        lodash.debounce(this.requestValidityDebounced, 250),
                        this.persistEvent,
                      )}
                    />,
                  )}
                </FormItem>
              }
              <div className="password-text">
                <FormattedMessage {...messages.secondPasswordFormTitle} />
              </div>
              <FormItem>
                {getFieldDecorator('password2', {
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage(
                        defaultErrorMessages.required,
                      ),
                    },
                  ],
                })(<Input type="password" className="reset-password-input" />)}
              </FormItem>
              <Row type="flex" align="middle" justify="center">
                <Col span={12}>
                  <Button
                    type="ghost"
                    className="reset-password-button"
                    href="/"
                  >
                    <FormattedMessage {...messages.revertTologin} />
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mcs-primary reset-password-button"
                    disabled={!this.globalValidity(passVal, p1, p2)}
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

export default compose<Props, {}>(
  withRouter,
  Form.create(),
  injectIntl,
)(CommunityChangePassword);
