import * as React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { DatePickerProps } from 'antd/lib/date-picker/interface';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormDatePickerProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  datePickerProps: DatePickerProps;
  unixTimestamp?: boolean;
}

const FormDatePicker: React.SFC<
  FormDatePickerProps & WrappedFieldProps
> = props => {
  let validateStatus = 'success' as
    | 'success'
    | 'warning'
    | 'error'
    | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  const value =
    props.input.value === ''
      ? undefined
      : props.unixTimestamp ? moment(props.input.value) : props.input.value;

  const onChange = (date: moment.Moment, dateString: string) => {
    if (props.unixTimestamp) {
      return props.input.onChange(date && parseInt(date.format('x'), 0));
    }
    return props.input.onChange(date);
  };

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
        value={value}
        onChange={onChange}
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
