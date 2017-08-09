import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

class InternalSelect extends Component {

  constructor(props) {
    super(props);
    const {
      input: { onChange },
      defaultValue,
      children,
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
  input: ['form-control'],
};

InternalSelect.propTypes = {
  defaultValue: PropTypes.string,
  input: PropTypes.shape(),
  meta: PropTypes.shape().isRequired,
};

export default InternalSelect;
