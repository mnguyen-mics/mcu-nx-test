import * as React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';
import { SwitchProps } from 'antd/lib/switch';
import { WrappedFieldProps } from 'redux-form';


const SwitchInput: React.SFC<{ className: string } & WrappedFieldProps> = props => {
  return (
    <Switch
      {...props.input}
      className={props.className}
    />
  );
}

SwitchInput.defaultProps = {
  className: 'mcs-table-switch'
};

export default SwitchInput;
