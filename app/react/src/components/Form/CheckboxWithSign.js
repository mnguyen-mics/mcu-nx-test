import React from 'react';
import PropTypes from 'prop-types';

function CheckboxWithSign({ sign }) {

  return <div className="checkbox-with-sign">{sign}</div>;
}

CheckboxWithSign.propTypes = {
  sign: PropTypes.string.isRequired,
};

export default CheckboxWithSign;
