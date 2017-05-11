import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import Alert from 'mcs-react-alert';

class InternalInput extends Component {
  render() {

    const {
      input,
      meta: { error, warning, touched },
      ...other
    } = this.props;

    return (
      <div >
        <Input {...input} type="text" {...other} />
        {(touched && error && <Alert type="danger" text={error} />) ||
          (warning && <Alert type="warning" text={warning} />)}
      </div>
    );
  }
}

InternalInput.defaultProps = {
  input: ['form-control']
};

InternalInput.propTypes = {
  input: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  meta: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default InternalInput;
