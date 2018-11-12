import { defineMessages } from 'react-intl';

export default defineMessages({
  resetPasswordTitle: {
    id: 'forgotPasswordForm.passwordTitle',
    defaultMessage: 'Forgot your password ?',
  },
  resetPasswordWrong: {
    id: 'forgotPasswordForm.passwordWrong',
    defaultMessage: 'Unknown email',
  },
  emailText: {
    id: 'forgotPasswordForm.email',
    defaultMessage: 'EMAIL',
  },
  resetPasswordDescription: {
    id: 'forgotPasswordForm.resetPassword',
    defaultMessage: 'Having trouble logging in? Just type your email address bellow and we will sent you an email with a link to reset your password.',
  },
  resetPasswordEmailRequired: {
    id: 'forgotPasswordForm.emaiRequired',
    defaultMessage: 'Please input your email!',
  },
  resetPasswordSubmit: {
    id: 'forgotPasswordForm.resetPasswordSubmit',
    defaultMessage: 'Continue',
  },
  resetPasswordBack: {
    id: 'forgotPasswordForm.backToLoginLink',
    defaultMessage: 'Cancel',
  },
  resetPasswordReturnToLogin: {
    id: 'forgotPasswordMailSent.returnToLogind',
    defaultMessage: 'Return to Login',
  },
  resetPasswordPasswordSent: {
    id: 'forgotPasswordMailSent.passsordSent',
    defaultMessage: 'We\'ve sent you an email with a link to finish reseting your password.',
  },
  resetPasswordEmailSpan: {
    id: 'forgotPasswordMailSent.emailSpan',
    defaultMessage: 'Can\'t find the email ? Try checking your spam folder.',
  },
});
