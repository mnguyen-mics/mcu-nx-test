import * as React from 'react';
import { DatePicker } from 'antd';
import { omit } from 'lodash';
import moment from 'moment';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { DatePickerProps } from 'antd/lib/date-picker';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormDatePickerProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  datePickerProps: DatePickerProps;
  small?: boolean;
  unixTimestamp?: boolean;
  disabled?: boolean;
  isoDate?: boolean;
}

const FormDatePicker: React.SFC<FormDatePickerProps & WrappedFieldProps> = props => {
  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  let value = props.input.value;
  if (value === '') {
    value = undefined;
  } else if (props.unixTimestamp || props.isoDate) {
    value = moment(value);
  }

  const onChange = (date: moment.Moment, dateString: string) => {
    if (props.unixTimestamp) {
      return props.input.onChange(date && parseInt(date.format('x'), 0));
    } else if (props.isoDate) {
      return props.input.onChange(dateString);
    }
    return props.input.onChange(date);
  };

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      small={props.small}
      {...props.formItemProps}
    >
      <DatePicker
        allowClear={false}
        {...omit(props.input, ['onBlur', 'onFocus'])}
        value={value}
        onChange={onChange}
        disabled={props.disabled}
        {...props.datePickerProps}
      />
    </FormFieldWrapper>
  );
};

FormDatePicker.defaultProps = {
  formItemProps: {},
  datePickerProps: {},
  helpToolTipProps: { title: '' },
};

export default FormDatePicker;
