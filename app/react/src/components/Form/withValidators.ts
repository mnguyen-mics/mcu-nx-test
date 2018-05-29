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
  invalidSponsoredField: {
    id: 'common.form.field.error.invalid.sponsored.field',
    defaultMessage: 'Max 25 characters',
  },
  invalidDescField: {
    id: 'common.form.field.error.invalid.desc.field',
    defaultMessage: 'Max 140 characters',
  },
  invalidRatingField: {
    id: 'common.form.field.error.invalid.rating.field',
    defaultMessage: 'Integer between 0 and 5',
  },
  invalidCtatextField: {
    id: 'common.form.field.error.invalid.ctatext.field',
    defaultMessage: 'Max 15 characters',
  },
});

type FormatMessageHandler = (
  messageDescriptor: FormattedMessage.MessageDescriptor,
  values?: {[key: string]: string | number | boolean | Date},
) => string;

export interface FieldValidatorsProps {
  formatIsNotZero: Validator;
  isRequired: Validator;
  isNotZero: Validator;
  isValidEmail: Validator;
  isValidFloat: Validator;
  isValidInteger: Validator;
  isValidDouble: Validator;
  isValidArrayOfNumber: Validator;
  isValidSponsoredField: Validator;
  isValidDescField: Validator;
  isValidRatingField: Validator;
  isValidCtatextField: Validator;
}

export interface ValidatorProps {
  fieldValidators: FieldValidatorsProps;
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

const isValidArrayOfNumber = (formatMessage: FormatMessageHandler): Validator => value => {
  const containsOnlyNumber = value.reduce((acc: boolean, val: string) => {
    return /^\d+$/.test(val) ? acc : false;
  }, true)
  return !(value && Array.isArray(value) && containsOnlyNumber) ? formatMessage(defaultErrorMessages.invalidNumber) : undefined
}

/***** Data Asset Types Validators 
See https://www.iab.com/wp-content/uploads/2017/04/OpenRTB-Native-Ads-Specification-Draft_1.2_2017-04.pdf
At page 39 --> 7.6 Data Asset Types *****/

/***** Type 1 Sponsored *****/

const isValidSponsoredField = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && value.length <= 25 ?
    formatMessage(defaultErrorMessages.invalidSponsoredField) : undefined;
};

/***** Type 2 Desc *****/

const isValidDescField = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && value.length <= 140 ?
    formatMessage(defaultErrorMessages.invalidDescField) : undefined;
};

/***** Type 3 Rating *****/

const isValidRatingField = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 5 ?
    formatMessage(defaultErrorMessages.invalidRatingField) : undefined;
};

/***** Type 12 Rating *****/

const isValidCtatextField = (formatMessage: FormatMessageHandler): Validator => value => {
  return value && value.length <= 15 ?
    formatMessage(defaultErrorMessages.invalidCtatextField) : undefined;
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
          isValidArrayOfNumber: isValidArrayOfNumber(formatMessage),
          isValidSponsoredField: isValidSponsoredField(formatMessage),
          isValidDescField: isValidDescField(formatMessage),
          isValidRatingField: isValidRatingField(formatMessage),
          isValidCtatextField: isValidCtatextField(formatMessage),
        },
      };
    }),
);
