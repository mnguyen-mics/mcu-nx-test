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
    defaultMessage: 'invalid number',
  },
  invalidUrl: {
    id: 'common.form.field.error.invalid_url',
    defaultMessage: 'invalid url',
  },
  invalidDomain: {
    id: 'common.form.field.error.invalid_domain',
    defaultMessage: 'invalid domain',
  },
});

const isRequired = formatMessage => value => {
  if (!value) {
    return formatMessage(defaultErrorMessages.required);
  }
  return undefined;
};

const isValidEmail = formatMessage => value => {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidEmail) : undefined;
};

const isValidUrl = formatMessage => value => {
  return value && !/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/.test(value) ?
    formatMessage(defaultErrorMessages.invalidUrl) : undefined;
};

const isValidDomain = formatMessage => value => {
  return value && !/^[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidDomain) : undefined;
};

const isValidNumber = formatMessage => value => {
  return value && !/^[0-9]$/.test(value) ?
    formatMessage(defaultErrorMessages.invalidNumber) : undefined;
};

const withValidators = compose(
  injectIntl,
  withProps(({ intl: { formatMessage } }) => ({
    fieldValidators: {
      isRequired: isRequired(formatMessage),
      isValidEmail: isValidEmail(formatMessage),
      isValidUrl: isValidUrl(formatMessage),
      isValidDomain: isValidDomain(formatMessage),
      isValidNumber: isValidNumber(formatMessage),
    },
  })),
);

export default withValidators;
