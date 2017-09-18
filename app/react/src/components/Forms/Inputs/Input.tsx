import * as React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import classNames from 'classnames';

import InternalInput from './InternalInput';

interface InputProps {
  defaultInputClassNames: Array<string>;
  inputClassNames: Array<string>;
  other: any;
}

const Input: React.SFC<InputProps> = props => {

  const inputClass = classNames(props.defaultInputClassNames, props.inputClassNames);

  return (
    <Field component={InternalInput} className={inputClass} {...props.other} />
  );
}

Input.defaultProps = {
  defaultInputClassNames: ['form-control'],
  inputClassNames: [],
};

export default Input;
