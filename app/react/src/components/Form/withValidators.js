import { compose, withProps } from 'recompose';
import { injectIntl, defineMessages } from 'react-intl';

const defaultErrorMessages = defineMessages({
  required: {
    id: 'common.form.field.error.required',
    defaultMessage: 'required',
  },
  invalidEmail: {
    id: 'common.form.field.error.invalid_email',
    defaultMessage: 'invalid email address',
  },
  invalidNumber: {
    id: 'common.form.field.error.invalid_number',
    defaultMessage: 'Invalid Number'
  }
});

const isRequired = formatMessage => value => {
  if (!value) {
    return formatMessage(defaultErrorMessages.required);
  }
  return undefined;
};

const isValidNumber = formatMessage => value => {
  return value && !/^\d+$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidNumber) : undefined;
};

const isValidEmail = formatMessage => value => {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidEmail) : undefined;
};

const withValidators = compose(
  injectIntl,
  withProps(({ intl: { formatMessage } }) => ({
    fieldValidators: {
      isRequired: isRequired(formatMessage),
      isValidEmail: isValidEmail(formatMessage),
      isValidNumber: isValidNumber(formatMessage)
    },
  })),
);

export default withValidators;
