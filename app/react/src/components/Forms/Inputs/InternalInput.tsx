import * as React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import Alert from 'mcs-react-alert';

interface InternalInputProps {
  input?: {};
  meta: {};
  other: any;
  touched?: any;
  warning?: any;
  error?: any;
}

const InternalInput: React.SFC<InternalInputProps> = props => {

  return (
    <div >
      <Input {...props.input} type="text" {...props.other} />
      {(props.touched && props.error && <Alert type="danger" text={props.error} />) ||
        (props.warning && <Alert type="warning" text={props.warning} />)}
    </div>
  );
}

InternalInput.defaultProps = {
  input: ['form-control'],
};
export default InternalInput;
