import * as React from 'react';
import Switch, { SwitchProps } from 'antd/lib/switch';
import { WrappedFieldInputProps } from 'redux-form';

export interface FormSwitchProps extends SwitchProps {}

type Props = FormSwitchProps & { input: WrappedFieldInputProps }

class FormSwitch extends React.Component<Props> {

  render() {

    const { input, ...rest } = this.props;

    return (
      <Switch
        {...rest}
        {...input}
      />
    );
  }
};

export default FormSwitch;
