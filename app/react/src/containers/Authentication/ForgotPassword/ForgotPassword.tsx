import React, { useState } from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Input, Button, Alert, Col, Row, Form } from 'antd';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import messages from './messages';
import { TYPES } from '../../../constants/types';
import { useInjection } from '../../../config/inversify.react';
import { IAuthService } from '@mediarithmics-private/advanced-components';

const FormItem = Form.Item;

type Props = InjectedIntlProps & FormComponentProps;

const ForgotPassword = (props: Props) => {
  const [form] = Form.useForm();
  const [hasError, setHasError] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [passwordSentSuccess, setPasswordSentSuccess] = useState(false);
  const authService = useInjection<IAuthService>(TYPES.IAuthService);

  const handleSubmit = (e: any) => {
    form.validateFields().then(values => {
      setIsRequesting(true);
      authService
        .sendPassword(values.email)
        .then(() => {
          setPasswordSentSuccess(true);
          setIsRequesting(false);
        })
        .catch(() => {
          setHasError(true);
          setIsRequesting(false);
        });
    });
  };

  const hasFieldError = form.getFieldError('email').length !== 0;
  const errorMsg =
    !hasFieldError && hasError ? (
      <Alert
        type='error'
        className='login-error-message'
        style={{ marginBottom: 24 }}
        message={<FormattedMessage {...messages.authenticationError} />}
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
        <FormattedMessage {...messages.resetPasswordTitle} />
      </div>
      <div className='reset-password-container-frame'>
        {!passwordSentSuccess && (
          <Form onFinish={handleSubmit} form={form} className='reset-password-form'>
            {errorMsg}
            <div className='reset-passwork-msg'>
              <FormattedMessage {...messages.resetPasswordDescription} />
            </div>
            <div className='password-text'>
              <FormattedMessage {...messages.emailText} />
            </div>
            <FormItem
              name='email'
              rules={[
                {
                  required: true,
                  message: messages.resetPasswordEmailRequired.defaultMessage,
                },
              ]}
            >
              <Input className='reset-password-input' />
            </FormItem>
            <Row>
              <Col span={12} className='reset-password-back-to-login'>
                <Button
                  type='link'
                  href='#/login'
                  className='reset-password-button'
                  loading={isRequesting}
                >
                  <FormattedMessage {...messages.resetPasswordBack} />
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type='primary'
                  htmlType='submit'
                  className='mcs-primary reset-password-button'
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
              <p className='reset-password-messages'>
                <FormattedMessage {...messages.resetPasswordPasswordSent} />
              </p>
              <p className='reset-password-messages'>
                <FormattedMessage {...messages.resetPasswordEmailSpan} />
              </p>
            </div>
            <Button
              type='primary'
              htmlType='button'
              className='mcs-primary reset-password-button'
              href='/'
            >
              <FormattedMessage {...messages.resetPasswordReturnToLogin} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default compose<Props, {}>(injectIntl)(ForgotPassword);
