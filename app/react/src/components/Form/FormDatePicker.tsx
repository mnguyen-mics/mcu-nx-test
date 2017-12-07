import * as React from 'react';
import { DatePicker } from 'antd';

// TS Interfaces
import { WrappedFieldInputProps, WrappedFieldMetaProps } from 'redux-form';
import { InputProps } from 'antd/lib/input/Input';
import { DatePickerProps } from 'antd/lib/date-picker';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

interface FormDatePickerProps {
  input: WrappedFieldInputProps;
  meta: WrappedFieldMetaProps;
  formItemProps: FormItemProps;
  inputProps?: InputProps;
  datePickerProps: DatePickerProps;
}

const FormDatePicker: React.SFC<FormDatePickerProps & FormFieldWrapperProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  if (props.input.value === '') {
    delete props.input.value;
  }

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >
      <DatePicker
        allowClear={false}
        {...props.input}
        {...props.datePickerProps}
      />
    </FormFieldWrapper>
  );
};

FormDatePicker.defaultProps = {
  formItemProps: {},
  datePickerProps: {},
  helpToolTipProps: {},
};

export default FormDatePicker;
