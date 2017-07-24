import React, { Component } from 'react';
import { compose, withProps } from 'recompose';
import { injectIntl, defineMessages } from 'react-intl';

const defaultErrorMessages = defineMessages({
  required: {
    id: 'common.form.field.error.required',
    defaultMessage: 'required'
  }
});

const isRequired = formatMessage => value => {
  if (!value) {
    return formatMessage(defaultErrorMessages.required);
  }
  return undefined;
};

const withValidators = compose(
  injectIntl,
  withProps(({ intl: { formatMessage } }) => ({
    fieldValidators: {
      isRequired: isRequired(formatMessage)
    }
  }))
);

export default withValidators;
