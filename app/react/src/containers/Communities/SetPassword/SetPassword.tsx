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
import { CommunityPasswordRequirement } from '../../../models/communities';
import {
  printPasswordRequirements,
  printPasswordMatching,
  globalValidity,
} from '../Helpers/PrintPasswordRequirements';

const logoUrl = require('../../../assets/images/logo.png');

export interface ChangePasswordProps {}

type Props = ChangePasswordProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{ communityToken: string }>;

interface State {
  fetchingPasswReq: boolean;
  fetchingPasswReqFailure: boolean;
  isRequesting: boolean;
  isError: boolean;
  password1?: string;
  password2?: string;
  isPasswordValid?: any;
  arePasswordsMatching?: any;
  requirementPrint?: any;
  technicalName: string;
  frontErrorMessages: string[];
  errorMessage?: string;
  passwordRequirements?: CommunityPasswordRequirement;
}

const messages = defineMessages({
  setPassword: {
    id: 'set.password.set.password',
    defaultMessage: 'Set your password',
  },
  revertTologin: {
    id: 'set.password.revert.to.login',
    defaultMessage: 'Go back to login',
  },
  passwordFormTitle: {
    id: 'set.password.form.title',
    defaultMessage: 'Password',
  },
  secondPasswordFormTitle: {
    id: 'set.second.password.form.title',
    defaultMessage: 'Confirm your password',
  },
  passwordRequirementError: {
    id: 'set.password.requirement.error',
    defaultMessage: 'Your passwords do not match the requirements',
  },
  standardsetPasswordError: {
    id: 'set.password.password.error',
    defaultMessage: 'Your password could not be set, please try again later.',
  },
});

class CommunitySetPassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingPasswReq: true,
      fetchingPasswReqFailure: false,
      isRequesting: false,
      isError: false,
      frontErrorMessages: [],
      technicalName: props.match.params.communityToken,
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
    this.setState({ password1: handler.target.value });
    if (this.state.password2) {
      this.setState({
        arePasswordsMatching: printPasswordMatching(
          handler.target.value,
          this.state.password2,
        ),
      });
    }
    if (this.state.passwordRequirements) {
      const req = this.state.passwordRequirements;
      CommunityService.getCommunityPasswordValidity(
        this.state.technicalName,
        handler.target.value,
      ).then(response => {
        this.setState({
          isPasswordValid: response.data,
          requirementPrint: printPasswordRequirements(req, response.data),
        });
      });
    } else {
      this.setState({ isError: true });
    }
  };

  checkMatch = (handler: any) => {
    handler.persist();
    this.setState({
      password2: handler.target.value,
      arePasswordsMatching: printPasswordMatching(
        this.state.password1,
        handler.target.value,
      ),
    });
  };

  componentDidMount() {
    CommunityService.getCommunityPasswordRequirements(
      this.props.match.params.communityToken,
    )
      .then(response => {
        console.log(response);
        this.setState({
          passwordRequirements: response.data,
          fetchingPasswReq: false,
          fetchingPasswReqFailure: false,
          requirementPrint: printPasswordRequirements(response.data),
          arePasswordsMatching: printPasswordMatching(),
        });
      })
      .catch(e => {
        console.log(e);
        this.setState({
          isError: true,
          fetchingPasswReqFailure: true,
          fetchingPasswReq: false,
        });
      });
  }

  componentDidCatch() {
    this.setState({
      isError: true,
      fetchingPasswReqFailure: true,
      fetchingPasswReq: false,
    });
  }

  handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    const {
      location: { search },
      history,
    } = this.props;
    const filter = parseSearch(search, SET_PASSWORD_SEARCH_SETTINGS);

    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (this.state.passwordRequirements !== undefined) {
        if (!err) {
          const isPasswordValid = () => {
            return (
              values.password1 === null ||
              values.password2 === null ||
              values.password1 !== values.password2
            );
          };

          if (
            isPasswordValid &&
            !this.state.fetchingPasswReqFailure &&
            globalValidity(this.state.isPasswordValid)
          ) {
            // validate
            AuthService.resetPassword(
              filter.email,
              filter.token,
              values.password1,
            )
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
        }
      } else {
        this.setState({
          isError: true,
          errorMessage: messages.standardsetPasswordError.defaultMessage,
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;

    const { isError, errorMessage, fetchingPasswReq } = this.state;
    const errorMsg =
      isError && errorMessage ? (
        <Alert
          type="error"
          style={{ marginBottom: 24 }}
          message={errorMessage}
          className="login-error-message"
        />
      ) : null;

    return (
      <div className="mcs-reset-password-container">
        <div className="image-wrapper">
          <img alt="mics-logo" className="reset-password-logo" src={logoUrl} />
        </div>
        <div className="reset-password-title">
          <FormattedMessage {...messages.setPassword} />
        </div>
        <div className="reset-password-container-frame">
          {fetchingPasswReq && <Spin size="large" />}
          {!fetchingPasswReq && (
            <Form onSubmit={this.handleSubmit} className="login-form">
              {errorMsg}
              <div className="reset-password-requirements">
                {this.state.requirementPrint}
                {this.state.arePasswordsMatching}
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
                        lodash.debounce(this.requestValidityDebounced, 1000),
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
                })(
                  <Input
                    type="password"
                    className="reset-password-input"
                    onChange={this.checkMatch}
                  />,
                )}
              </FormItem>
              <Row type="flex" align="middle" justify="center">
                <Col span={12}>
                  <Button
                    type="ghost"
                    className="reset-password-button"
                    href='/'
                  >
                    <FormattedMessage {...messages.revertTologin} />
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mcs-primary reset-password-button"
                  >
                    <FormattedMessage {...messages.setPassword} />
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
)(CommunitySetPassword);
