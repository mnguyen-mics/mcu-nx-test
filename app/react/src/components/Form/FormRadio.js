import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';


function FormRadio({ title, ...otherProps }) {

  return <Radio {...otherProps}>{title}</Radio>;
}

FormRadio.defaultProps = {
  className: 'form-radio',
};

FormRadio.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
};

export default FormRadio;
