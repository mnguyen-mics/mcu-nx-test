import * as React from 'react';
import { Checkbox } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { FormFieldWrapper } from '.';

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

const FormCheckboxGroup: React.SFC<FormCheckboxGroupProps & WrappedFieldProps> = props => {
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

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      validateStatus={validateStatus}
    >
      <CheckboxGroup
        options={options}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        className={className}
      />
    </FormFieldWrapper>
  );
};

export default FormCheckboxGroup;
