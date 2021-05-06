import { defineMessages } from 'react-intl';

export default defineMessages({
  resetPasswordTitle: {
    id: 'authentication.forgotPasswordForm.passwordTitle',
    defaultMessage: 'Forgot your password ?',
  },
  authenticationError: {
    id: 'authentication.forgotPasswordForm.authentication-error',
    defaultMessage: 'Authentication error',
  },
  emailText: {
    id: 'authentication.forgotPasswordForm.email',
    defaultMessage: 'EMAIL',
  },
  resetPasswordDescription: {
    id: 'authentication.forgotPasswordForm.resetPassword',
    defaultMessage:
      'Having trouble logging in? Just type your email address bellow and we will sent you an email with a link to reset your password.',
  },
  resetPasswordEmailRequired: {
    id: 'authentication.forgotPasswordForm.emaiRequired',
    defaultMessage: 'Please input your email!',
  },
  resetPasswordSubmit: {
    id: 'authentication.forgotPasswordForm.resetPasswordSubmit',
    defaultMessage: 'Continue',
  },
  resetPasswordBack: {
    id: 'authentication.forgotPasswordForm.backToLoginLink',
    defaultMessage: 'Cancel',
  },
  resetPasswordReturnToLogin: {
    id: 'authentication.forgotPasswordMailSent.returnToLogind',
    defaultMessage: 'Return to Login',
  },
  resetPasswordPasswordSent: {
    id: 'authentication.forgotPasswordMailSent.passsordSent',
    defaultMessage: "We've sent you an email with a link to finish reseting your password.",
  },
  resetPasswordEmailSpan: {
    id: 'authentication.forgotPasswordMailSent.emailSpan',
    defaultMessage: "Can't find the email ? Try checking your spam folder.",
  },
});
