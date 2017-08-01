import { defineMessages } from 'react-intl';

export default defineMessages({
  resetPasswordTitle: {
    id: 'forgotPasswordForm.resetPassword',
    defaultMessage: 'To reset your password please enter your email address.',
  },
  resetPasswordEmail: {
    id: 'forgotPasswordForm.emaiPlaceholder',
    defaultMessage: 'Your Email Address',
  },
  resetPasswordEmailRequired: {
    id: 'forgotPasswordForm.emaiRequired',
    defaultMessage: 'Please input your email!',
  },
  resetPasswordSubmit: {
    id: 'forgotPasswordForm.resetPasswordSubmit',
    defaultMessage: 'Reset Password',
  },
  resetPasswordBack: {
    id: 'forgotPasswordForm.backToLoginLink',
    defaultMessage: 'Take me back to login',
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
    defaultMessage: 'Can\'t find the email ? try checking your  spam folder.',
  },
});
