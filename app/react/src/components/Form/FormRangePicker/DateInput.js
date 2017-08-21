import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';

function DateInput({ input, inputProps }) {

  return (
    <DatePicker
      {...input}
      {...inputProps}
    />
  );
}

DateInput.defaultProps = {
  input: {}, // TODO à enlever
};

DateInput.propTypes = {
  inputProps: PropTypes.shape({
    format: PropTypes.string,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }).isRequired,

  input: PropTypes.shape().isRequired, /* Redux-form props */
};

export default DateInput;
