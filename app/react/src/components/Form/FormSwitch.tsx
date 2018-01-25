import * as React from 'react';
import Switch, { SwitchProps } from 'antd/lib/switch';
import { WrappedFieldProps } from 'redux-form';

export interface FormSwitchProps extends SwitchProps {
  invert?: boolean;
}

type Props = FormSwitchProps & WrappedFieldProps;

class FormSwitch extends React.Component<Props> {
  render() {
    const { input, meta, invert, ...rest } = this.props;

    const checked = invert ? !input.value : input.value;
    const onChange = (_checked: boolean) => {
      invert ? input.onChange(!_checked) : input.onChange(_checked);
    };

    return (
      <Switch {...rest} {...input} checked={checked} onChange={onChange} />
    );
  }
}

export default FormSwitch;
