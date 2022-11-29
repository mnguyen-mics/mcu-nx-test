import * as React from 'react';
import { Switch } from 'antd';
import { WrappedFieldProps } from 'redux-form';

const SwitchInput: React.SFC<{ className?: string } & WrappedFieldProps> = props => {
  return <Switch {...props.input} className={props.className} />;
};

SwitchInput.defaultProps = {
  className: 'mcs-table-switch',
};

export default SwitchInput;
