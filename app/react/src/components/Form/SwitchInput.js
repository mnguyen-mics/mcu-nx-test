import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';

function SwitchInput({ className, input }) {
  return (
    <Switch
      className={className}
      checked={input.value}
    />
  );
}

SwitchInput.defaultProps = {
  className: 'mcs-table-switch'
};

SwitchInput.propTypes = {
  className: PropTypes.string,

  input: PropTypes.shape({
    value: PropTypes.string,
  }).isRequired,
};

export default SwitchInput;
