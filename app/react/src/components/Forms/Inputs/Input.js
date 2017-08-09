import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import classNames from 'classnames';

import InternalInput from './InternalInput';

function Input({
  defaultInputClassNames,
  inputClassNames,
  ...other
}) {

  const inputClass = classNames(defaultInputClassNames, inputClassNames);

  return (
    <Field component={InternalInput} className={inputClass} {...other} />
  );
}

Input.defaultProps = {
  defaultInputClassNames: ['form-control'],
  inputClassNames: [],
};

Input.propTypes = {
  defaultInputClassNames: PropTypes.arrayOf(PropTypes.string),
  inputClassNames: PropTypes.arrayOf(PropTypes.string),
};

export default Input;
