import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const { Option } = Select;

function FormSelectAddon({ input, options, style }) {
  const value = input.value || options[0];
  const filteredOptions = options.filter(option => option !== value);
  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option} value={option}>{option}</Option>
    ));

  return (
    <Select
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      {...input}
    >
      {optionsToDisplay}
    </Select>
  );
}

FormSelectAddon.defaultProps = {
  field: {},
  input: {},
  style: { width: 100 },
};

FormSelectAddon.propTypes = {
  input: PropTypes.shape().isRequired,
  options: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  style: PropTypes.shape(),
};

export default FormSelectAddon;
