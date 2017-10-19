import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';

function SwitchInput({ className, input }) {

  return (
    <Switch
      {...input}
      className={className}
    />
  );
}

SwitchInput.defaultProps = {
  className: 'mcs-table-switch'
};

SwitchInput.propTypes = {
  className: PropTypes.string,

  input: PropTypes.shape({
    value: PropTypes.bool,
  }).isRequired,
};

export default SwitchInput;
