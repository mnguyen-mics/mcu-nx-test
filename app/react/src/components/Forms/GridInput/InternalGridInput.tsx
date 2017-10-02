import * as React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

interface InternalGridInputProps {
  input?: {};
  meta: {
    error?: any;
    touched?: any;
  };
  className: string;
  other:any;
}

const InternalGridInput: React.SFC<InternalGridInputProps> = (props) => {

  const classValue = (props.meta.touched && props.meta.error) ? 'mics-gridinput-input-error' : props.className;

  return (
    <div> <Input {...props.input} className={classValue} type="text" {...props.other} /> </div>
  );
}

InternalGridInput.defaultProps = {
  input: ['form-control'],
};

export default InternalGridInput;
