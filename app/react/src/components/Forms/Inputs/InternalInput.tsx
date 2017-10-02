import * as React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import Alert from 'mcs-react-alert';

interface InternalInputProps {
  input?: {};
  meta: {
    touched?: any;
    warning?: any;
    error?: any;
  };
  other: any;
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

InternalInput.defaultProps = {
  input: ['form-control'],
};
export default InternalInput;
