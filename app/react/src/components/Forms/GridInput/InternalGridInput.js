import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

function InternalGridInput({
  input,
  meta: { error, touched },
  className,
  ...other
}) {

  const classValue = (touched && error) ? 'mics-gridinput-input-error' : className;

  return (
    <div> <Input {...input} className={classValue} type="text" {...other} /> </div>
  );
}

InternalGridInput.defaultProps = {
  input: ['form-control'],
};

InternalGridInput.propTypes = {
  input: PropTypes.shape(),
  meta: PropTypes.shape().isRequired,
  className: PropTypes.string.isRequired,
};

export default InternalGridInput;
