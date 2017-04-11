import React, { Component, PropTypes } from 'react';
import { Input } from 'antd';

class InternalGridInput extends Component {
  render() {

    const {
      input,
      meta: { error, touched },
      className,
      ...other
    } = this.props;

    const classValue = (touched && error) ? 'mics-gridinput-input-error' : className;

    return (
      <div> <Input {...input} className={classValue} type="text" {...other} /> </div>
    );
  }
}

InternalGridInput.defaultProps = {
  input: ['form-control']
};

InternalGridInput.propTypes = {
  input: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  meta: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string.isRequired
};

export default InternalGridInput;
