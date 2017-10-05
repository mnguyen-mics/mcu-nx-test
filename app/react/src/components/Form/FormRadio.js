import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';


function FormRadio({ title, ...otherProps }) {

  return <Radio {...otherProps}>{title}</Radio>;
}

FormRadio.propTypes = {
  title: PropTypes.string.isRequired,
};

export default FormRadio;
