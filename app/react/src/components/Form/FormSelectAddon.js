import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const { Option } = Select;

function FormSelectAddon({
  input: { onChange, value, ...inputProps },
  options,
  style
}) {
  const formValue = value || options[0];
  const filteredOptions = options.filter(option => option.key !== formValue.key);
  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option.key} value={option.key}>{option.text}</Option>
    ));

  return (
    <Select
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      onChange={(e) => onChange(e)}
      value={value}
      {...inputProps}
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

  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,

  style: PropTypes.shape(),
};

export default FormSelectAddon;
