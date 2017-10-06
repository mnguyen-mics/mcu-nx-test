import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

function FormCheckbox({ input }) {

  return <Checkbox {...input} />;
}

FormCheckbox.propTypes = {
  input: PropTypes.shape().isRequired,
};

export default FormCheckbox;
