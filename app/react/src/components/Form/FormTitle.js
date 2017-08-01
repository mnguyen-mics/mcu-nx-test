/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const FormTitle = ({ titleMessage, subTitleMessage }) => (
  <div className="title-container">
    <div className="title">
    <FormattedMessage
      {...titleMessage}
    />
    </div>
    {!!subTitleMessage &&
      <div className="subtitle">
      <FormattedMessage
        {...subTitleMessage}
      />
      </div>
    }
  </div>
);

FormTitle.defaultProps = {
  subTitleMessage: null
};

// FormTitle.propTypes = {
//   titleMessage: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     defaultMessage: PropTypes.string.isRequired,
//   }).isRequired,
//   subTitleMessage: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     defaultMessage: PropTypes.string.isRequired,
//   })
// };

export default FormTitle;
