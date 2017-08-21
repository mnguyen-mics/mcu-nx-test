import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const { Option } = Select;

function FormSelectAddon({ input, options, style }) {
  const { name, onChange /* , value */ } = input;
  // const filteredOptions = options.filter(option => option !== value);
  const optionsToDisplay = options.map(option => (
    <Option key={option} value={option}>{option}</Option>
  ));

  return (
    <Select
      defaultValue="Per Day"
      onChange={onChange(name)}
      style={{ display: 'flex', justifyContent: 'center', ...style }}
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
