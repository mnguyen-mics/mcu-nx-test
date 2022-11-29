import * as React from 'react';
import { Checkbox } from 'antd';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormBooleanProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps & { hasMarginBottom?: boolean };
  inputProps?: CheckboxProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  small?: boolean;
}

interface StateInterface {
  checked: boolean;
}

class FormBoolean extends React.Component<FormBooleanProps & WrappedFieldProps, StateInterface> {
  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  constructor(props: FormBooleanProps & WrappedFieldProps) {
    super(props);
    this.state = {
      checked: props.input.value ? props.input.value : false,
    };
  }

  onChange = (checked: boolean) => {
    const { input } = this.props;
    input.onChange(checked);
    this.setState({
      checked: checked,
    });
  };

  render() {
    const { meta, formItemProps, inputProps, helpToolTipProps, input, small } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Checkbox {...input} {...inputProps} defaultChecked={this.state.checked} />
      </FormFieldWrapper>
    );
  }
}

export default FormBoolean;
