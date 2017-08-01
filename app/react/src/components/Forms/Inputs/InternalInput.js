import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import Alert from 'mcs-react-alert';

function InternalInput({
  input,
  meta: { error, warning, touched },
  ...other
}) {

  return (
    <div >
      <Input {...input} type="text" {...other} />
      {(touched && error && <Alert type="danger" text={error} />) ||
        (warning && <Alert type="warning" text={warning} />)}
    </div>
  );
}

InternalInput.defaultProps = {
  input: ['form-control'],
};

InternalInput.propTypes = {
  input: PropTypes.shape(),
  meta: PropTypes.shape().isRequired,
};

export default InternalInput;
