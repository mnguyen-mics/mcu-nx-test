import { compose, withProps } from 'recompose';
import { injectIntl, defineMessages, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Validator } from 'redux-form';

const defaultErrorMessages = defineMessages({
  required: {
    id: 'common.form.field.error.required',
    defaultMessage: 'required',
  },
  formatNotZero: {
    id: 'common.form.field.error.format_not_zero',
    defaultMessage: 'Width and/or height cannot be 0',
  },
  invalidEmail: {
    id: 'common.form.field.error.invalid_email',
    defaultMessage: 'invalid email address',
  },
  invalidFloat: {
    id: 'common.form.field.error.invalid_float',
    defaultMessage: 'invalid Number, please make sure you use a dot instead of a comma and that your number doesn\'t exceed 2 decimals',
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
  positiveNumber: {
    id: 'common.form.field.error.positive_number',
    defaultMessage: 'Number must be above 0',
  },
});

type FormatMessageHandler = (
  messageDescriptor: FormattedMessage.MessageDescriptor,
  values?: {[key: string]: string | number | boolean | Date},
) => string;

export interface ValidatorProps {
  fieldValidators: {
    formatIsNotZero: Validator;
    isRequired: Validator;
    isNotZero: Validator;
    isValidEmail: Validator;
    isValidFloat: Validator;
    isValidInteger: Validator;
    isValidDouble: Validator;
  };
}

const isRequired = (formatMessage: FormatMessageHandler): Validator => value => {
  return (!value || (value.length !== undefined && !value.length)
    ? formatMessage(defaultErrorMessages.required)
    : undefined
  );
};

const isNotZero = (formatMessage: FormatMessageHandler): Validator => value => {
  return (value && value === '0'
    ? formatMessage(defaultErrorMessages.positiveNumber)
    : undefined
  );
};

const formatIsNotZero = (formatMessage: FormatMessageHandler): Validator => value => {
  const format = value ? value.split('x') : '';

  return (value && format && (Number(format[0]) === 0 || Number(format[1]) === 0)
  ? formatMessage(defaultErrorMessages.formatNotZero)
  : ''
  );
};

const isValidEmail = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidEmail) : undefined;
};

const isValidFloat = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && !/^[0-9]+(\.[0-9]{1,2})?$/i.test(value) ?
    formatMessage(defaultErrorMessages.invalidFloat) : undefined;
};

const isValidDouble = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && (isNaN(Number(value)) || value.length > 18) ?
    formatMessage(defaultErrorMessages.invalidNumber) : undefined;
};

const isValidInteger = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && !/^\d+$/.test(value) ?
    formatMessage(defaultErrorMessages.invalidNumber) : undefined;
};

export default compose<{}, ValidatorProps>(
  injectIntl,
  withProps<ValidatorProps, InjectedIntlProps>(
    props => {
      const { intl: { formatMessage } } = props;
      return {
        fieldValidators: {
          formatIsNotZero: formatIsNotZero(formatMessage),
          isNotZero: isNotZero(formatMessage),
          isRequired: isRequired(formatMessage),
          isValidEmail: isValidEmail(formatMessage),
          isValidFloat: isValidFloat(formatMessage),
          isValidInteger: isValidInteger(formatMessage),
          isValidDouble: isValidDouble(formatMessage),
        },
      };
    }),
);
