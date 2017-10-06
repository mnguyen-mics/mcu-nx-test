import React from 'react';
import PropTypes from 'prop-types';

function CheckboxWithSign({ sign, ...otherProps }) {

  return <div className="checkbox-with-sign" {...otherProps}>{sign}</div>;
}

CheckboxWithSign.propTypes = {
  sign: PropTypes.string.isRequired,
};

export default CheckboxWithSign;
