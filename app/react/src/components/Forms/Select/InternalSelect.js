import React, { Component, PropTypes } from 'react';
import { Select } from 'antd';

class InternalSelect extends Component {

  constructor(props) {
    super(props);
    const {
      input: { onChange },
      defaultValue,
      children
    } = this.props;

    const firstValue = defaultValue ? defaultValue : children[0].props.value;

    onChange(firstValue);
  }

  render() {

    const {
      input: { onChange },
      children,
      ...other
    } = this.props;


    return (
      <Select type="text" {...other} onSelect={value => onChange(value)} >
        {children}
      </Select>
    );
  }
}

InternalSelect.defaultProps = {
  defaultValue: undefined,
  input: ['form-control']
};

InternalSelect.propTypes = {
  defaultValue: PropTypes.string,
  input: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  meta: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default InternalSelect;
