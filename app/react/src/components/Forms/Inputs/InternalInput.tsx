import * as React from 'react';
import { Input } from 'antd';
import Alert from 'mcs-react-alert';

// TS Interfaces
import { InputProps } from 'antd/lib/input/Input';
import { WrappedFieldInputProps, WrappedFieldMetaProps } from 'redux-form'

interface InternalInputProps {
  input: WrappedFieldInputProps;
  meta: WrappedFieldMetaProps;
  other: object;
}

const InternalInput: React.SFC<InternalInputProps> = props => {

  return (
    <div >
      <Input {...props.input} type="text" {...props.other} />
      {(props.meta.touched && props.meta.error && <Alert type="danger" text={props.meta.error} />) ||
        (props.meta.warning && <Alert type="warning" text={props.meta.warning} />)}
    </div>
  );
}

export default InternalInput;
