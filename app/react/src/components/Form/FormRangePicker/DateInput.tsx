import * as React from 'react';
import { DatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { WrappedFieldProps } from 'redux-form';

export type DateInputProps = WrappedFieldProps & DatePickerProps;

const DateInput: React.StatelessComponent<DateInputProps> = props => {
  const { input, ...otherProps} = props;
  const { value, ...rest } = props.input;
  const correctedInput = (!value ? rest : { ...rest, value });

  /*
   * Because antd DatePicker doesn't support onBlur,
   * and because redux-form needs onBlur to handle errors,
   * we need to bind redux-form's onBlur method to antd's onOpenChange artificially.
   */
  function handleOnOpenChange(windowIsOpen: boolean) {
    return (windowIsOpen
      ? props.input.onFocus(undefined!)
      : props.input.onBlur(undefined)
    );
  }

  return (
    <DatePicker
      {...correctedInput}
      {...otherProps}
      allowClear={false}
      onOpenChange={handleOnOpenChange}
    />
  );
};

DateInput.defaultProps = {
  format: 'DD/MM/YYYY',
  placeholder: '',
  showTime: undefined,
};

export default DateInput;
