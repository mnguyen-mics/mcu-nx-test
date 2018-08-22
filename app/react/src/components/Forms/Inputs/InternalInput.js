import React, { Component, PropTypes } from 'react';

class InternalInput extends Component {
  render() {

    const {
      input,
      meta: { error, warning, touched },
      ...other
    } = this.props;

    return (
      <div>
        <input {...input} type="text" {...other} />
        {(touched && error) ||
         warning}
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
