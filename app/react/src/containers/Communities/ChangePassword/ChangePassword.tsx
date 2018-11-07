import * as React from 'react';
import { Form, Row, Col, Input, Button, Alert, Spin } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage,
  defineMessages,
} from 'react-intl';

import { compose } from 'recompose';
import { FormComponentProps } from 'antd/lib/form';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  SET_PASSWORD_SEARCH_SETTINGS,
  parseSearch,
} from '../../../utils/LocationSearchHelper';
import AuthService from '../../../services/AuthService';
import { defaultErrorMessages } from '../../../components/Form/withValidators';
import CommunityService from '../../../services/CommunityServices';
import { CommunityPasswordRequirement } from '../../../models/communities';
import { checkPasswordRequirements } from './CheckPassword';

const logoUrl = require('../../../assets/images/logo.png');

export interface SetPasswordProps {}

type Props = SetPasswordProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{ communityToken: string }>;

interface State {
  fetchingPasswReq: boolean;
  fetchingPasswReqFailure: boolean;
  isRequesting: boolean;
  isError: boolean;
  frontErrorMessages: string[];
  backErrorMessage?: string;
  passwordRequirements?: CommunityPasswordRequirement;
}

const messages = defineMessages({
  setPassword: {
    id: 'reset.set.password.set.password',
    defaultMessage: 'Change your password',
  },
  revertologin: {
    id: 'reset.set.password.rever.to.login',
    defaultMessage: 'Go back to login',
  },
  passwordFormTitle: {
    id: 'reset.set.password.form.title',
    defaultMessage: 'PASSWORD',
  },
  standardSetPasswordError: {
    id: 'reset.set.password.error',
    defaultMessage:
      'Your password could not be changed, please try again later.',
  },
});

class CommunityChangePassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingPasswReq: true,
      fetchingPasswReqFailure: true,
      isRequesting: false,
      isError: false,
      frontErrorMessages: [],
    };   
  }


  componentDidMount() {
    CommunityService.getCommunityPasswordRequirements(this.props.match.params.communityToken)
    .then((response) => {
      this.setState({ passwordRequirements: response.data, fetchingPasswReq: false, fetchingPasswReqFailure: false, });
    })
    .catch(() => {
      this.setState({ isError: true, fetchingPasswReqFailure: true, })
    });
  }

  componentDidCatch() {
    this.setState({ isError: true, fetchingPasswReqFailure: true, })
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
          const isPasswordValid = checkPasswordRequirements(
            values.password1,
            values.password2,
            this.state.passwordRequirements,
          );
          if (isPasswordValid.isCompliant && !this.state.fetchingPasswReqFailure) {
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
                  frontErrorMessages: isPasswordValid.errorMessages,
                  isError: true,
                  backErrorMessage: errBack.error,
                });
              });
          } else if (isPasswordValid.errorMessages.length > 0) {
            this.setState({
              isError: true,
              frontErrorMessages: isPasswordValid.errorMessages,
            });
          } else {
            this.setState({
              isError: true,
            });
          }
        }
      } else {
        this.setState({
          isError: true,
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;

    const { isError, backErrorMessage, frontErrorMessages, fetchingPasswReq } = this.state;

    const frontErrorMsg =
      isError && !backErrorMessage ? (
        <Alert
          type="error"
          style={{ marginBottom: 24 }}
          message={
            frontErrorMessages.length === 0 ? (
              <FormattedMessage {...messages.standardSetPasswordError} />
            ) : (
              frontErrorMessages.map((msg, index) => <li key={index}>{msg}</li>)
            )
          }
          className="login-error-message"
        />
      ) : null;

    const backErrorMsg =
      isError && backErrorMessage ? (
        <Alert
          type="error"
          style={{ marginBottom: 24 }}
          message={backErrorMessage}
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
           { fetchingPasswReq && <Spin size="large" /> }
           { !fetchingPasswReq && <Form onSubmit={this.handleSubmit} className="login-form">
            {frontErrorMsg}
            {backErrorMsg}
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
                })(<Input type="password" className="reset-password-input" />)}
              </FormItem>
            }
            <div className="password-text">
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
              })(<Input type="password" className="reset-password-input" />)}
            </FormItem>
            <Row type="flex" align="middle" justify="center">
              <Col span={12} className="reset-password-back-to-login">
                <Link to={'/login'}>
                  <FormattedMessage {...messages.revertologin} />
                </Link>
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
            </Form> }
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
