import * as React from 'react';
import { TimePicker } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { FormFieldWrapper } from '.';

export interface FormTimePickerProps {
  className?: string;
  timeFormat: string;
  allowClear?: boolean;
  minuteStep?: number;
  disabled?: boolean;
}

const FormTimePicker: React.SFC<FormTimePickerProps & WrappedFieldProps> = props => {
  const { timeFormat, disabled, className, allowClear, minuteStep, input } = props;

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.invalid) validateStatus = 'error';
  if (props.meta.warning) validateStatus = 'warning';

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      validateStatus={validateStatus}
    >
      <TimePicker
        disabled={disabled}
        format={timeFormat}
        allowClear={allowClear}
        minuteStep={minuteStep}
        className={className}
        value={input.value}
        onChange={input.onChange}
      />
    </FormFieldWrapper>
  );
};

export default FormTimePicker;
