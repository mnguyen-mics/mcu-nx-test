import * as React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { SelectProps, OptionProps } from 'antd/lib/select'

const { Option } = Select;

interface FormSelectAddonProps {
  options: OptionProps[]
  style: React.CSSProperties
}

const FormSelectAddon: React.SFC<FormSelectAddonProps & WrappedFieldProps> = props => {

  const {
    input: { value, onChange },
    style,
    options
  } = props;

  const formValue = value || options[0];
  const filteredOptions = options.filter(option => option.value !== formValue.key);
  
  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option.value} value={option.value}>{option.title}</Option>
  ));

  return (

    <Select
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      onChange={onChange}
      value={value}      
    >
      {optionsToDisplay}
    </Select>
  );
}

FormSelectAddon.defaultProps = {
  input: null,
  style: { width: 100 },
};

export default FormSelectAddon;
