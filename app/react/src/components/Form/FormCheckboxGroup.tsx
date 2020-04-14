import * as React from 'react';
import { Checkbox } from 'antd';
import { WrappedFieldProps } from 'redux-form';

interface OptionProps {
  label: string;
  value: string;
}

export interface FormCheckboxGroupProps {
  className?: string;
  options: OptionProps[];
  valueAsString?: boolean;
  disabled?: boolean;
}

const CheckboxGroup = Checkbox.Group;

const FormCheckboxGroup: React.SFC<FormCheckboxGroupProps &
  WrappedFieldProps> = props => {
  const { options, input, disabled, className } = props;

  const defaultValue =
    input.value === ''
      ? []
      : props.valueAsString && !Array.isArray(input.value)
      ? input.value.split(',')
      : input.value;

  const onChange = (valueOnChange: any) => {
    if (props.valueAsString && Array.isArray(valueOnChange)) {
      return input.onChange(valueOnChange.join(','));
    }
    return input.onChange(valueOnChange);
  };

  // const onChange = (e: any) => input.onChange(e.target.value);

  return (
    <CheckboxGroup
      options={options}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={onChange}
      className={className}
    />
  );
};

export default FormCheckboxGroup;
