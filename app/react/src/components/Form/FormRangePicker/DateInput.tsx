import * as React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { WrappedFieldProps } from 'redux-form';

export type DateInputProps = WrappedFieldProps & DatePickerProps;

const DateInput: React.StatelessComponent<DateInputProps> = props => { 
  const { input, ...otherProps} = props;
  const { value, ...rest } = props.input;
  const correctedInput = (!value ? rest : { ...rest, value });

  return (
    <DatePicker
      {...correctedInput}
      {...otherProps}
      allowClear={false}
      onOpenChange={windowIsOpen => {
        /*
         * Because antd DatePicker doesn't support onBlur,
         * and because redux-form needs onBlur to handle errors,
         * we need to bind redux-form's onBlur method to antd's onOpenChange artificially.
         */
        return (windowIsOpen
          ? props.input.onFocus(null)
          : props.input.onBlur(null)
        );
      }}
    />
  );
}

DateInput.defaultProps = {
  format: 'DD/MM/YYYY',
  placeholder: '',
  showTime: null,
};

export default DateInput;

