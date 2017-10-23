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
});

const isRequired = formatMessage => value => {
  return (!value || (value.length !== undefined && !value.length)
    ? formatMessage(defaultErrorMessages.required)
    : undefined
  );
};

const isNotZero = formatMessage => value => {
  return (!value || value === '0'
    ? formatMessage(defaultErrorMessages.required)
    : undefined
  );
};

const isValidEmail = formatMessage => value => {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidEmail) : undefined;
};

const withValidators = compose(
  injectIntl,
  withProps(({ intl: { formatMessage } }) => ({
    fieldValidators: {
      isNotZero: isNotZero(formatMessage),
      isRequired: isRequired(formatMessage),
      isValidEmail: isValidEmail(formatMessage),
    },
  })),
);

export default withValidators;
