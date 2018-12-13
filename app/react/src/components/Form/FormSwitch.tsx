import * as React from 'react';
import { omit } from 'lodash';
import Switch, { SwitchProps } from 'antd/lib/switch';
import { WrappedFieldProps } from 'redux-form';

export interface FormSwitchProps extends SwitchProps {
  invert?: boolean;
  disabled?: boolean;
}

type Props = FormSwitchProps & WrappedFieldProps;

class FormSwitch extends React.Component<Props> {
  render() {
    const { input, meta, invert, disabled, ...rest } = this.props;

    const checked = invert ? !input.value : input.value;
    const onChange = (_checked: boolean) => {
      invert ? input.onChange(!_checked) : input.onChange(_checked);
    };

    return (
      <Switch
        {...rest}
        {...omit(input, ['onFocus', 'onBlur'])}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
}

export default FormSwitch;
