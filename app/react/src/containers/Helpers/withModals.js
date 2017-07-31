// import React, { Component } from 'react';
// import { compose, withProps } from 'recompose';
// import { injectIntl, defineMessages } from 'react-intl';
// import { Modal } from 'antd';

// const messages = defineMessages({
//   required: {
//     id: 'common.form.field.error.required',
//     defaultMessage: 'required'
//   }
// });

// const showConfirmCloseModal = formatMessage => value => {
//   if (!value) {
//     return formatMessage(defaultErrorMessages.required);
//   }
//   return undefined;
// };

// const withModals = compose(
//   injectIntl,
//   withProps(({ intl: { formatMessage } }) => ({
//     fieldValidators: {
//       isRequired: isRequired(formatMessage)
//     }
//   }))
// );

// export default withModals;
