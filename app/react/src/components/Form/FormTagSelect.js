import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const Option = Select.Option;

function FormTagSelect(props) {

  const displayOptions = props.options.map(({ label, value, ...rest }) => (
    <Option {...rest} key={value} value={String(value)}>{label}</Option>
  ));

  return (
    <Select
      {...props}
      defaultValue={props.input.value || []}
      onChange={values => props.input.onChange(values)}
      placeholder="Please select"
    >
      {displayOptions}
    </Select>
  );
}

FormTagSelect.defaultProps = {
  formValues: [],
  mode: 'multiple',
};

FormTagSelect.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string.isRequired),
    ]).isRequired,
  }).isRequired,

  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
};

export default FormTagSelect;
