import * as React from 'react';
import { Form, Input, Button, Alert } from 'antd';
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
import {
  SET_PASSWORD_SEARCH_SETTINGS,
  parseSearch,
} from '../../../utils/LocationSearchHelper';
import AuthService from '../../../services/AuthService';
import { defaultErrorMessages } from '../../../components/Form/withValidators';
import CommunityService from '../../../services/CommunityServices';
import { CommunityPasswordRequirement } from '../../../models/communities';
import { CheckPassword } from './CheckPassword';

const logoUrl = require('../../../assets/images/logo.png');

export interface SetPasswordProps {}

type Props = SetPasswordProps &
  InjectedIntlProps &
  FormComponentProps &
  RouteComponentProps<{ communityToken: string }>;

interface State {
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
      isRequesting: false,
      isError: false,
      frontErrorMessages: [],
    };
    CommunityService.getCommunity(this.props.match.params.communityToken).then(
      response => {
        response.data.forEach(dataType => {
          if (dataType.type === 'PASSWORD_REQUIREMENTS') {
            this.setState({ passwordRequirements: dataType });
          }
        });
      },
    );
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
          const isPasswordValid = CheckPassword(
            values.password1,
            values.password2,
            this.state.passwordRequirements,
          );
          if (isPasswordValid.isCompliant === true) {
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

    const { isError, backErrorMessage, frontErrorMessages } = this.state;

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
          <Form onSubmit={this.handleSubmit} className="login-form">
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
            <div className="two-buttons">
              <Link to={'/login'} className="reset-password-button">
                <FormattedMessage {...messages.revertologin} />
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                className="mcs-primary reset-password-button"
              >
                <FormattedMessage {...messages.setPassword} />
              </Button>
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
)(CommunityChangePassword);
