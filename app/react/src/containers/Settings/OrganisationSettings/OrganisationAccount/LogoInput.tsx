import * as React from 'react';

import { EditableLogo } from '../../../Logo';
import { FormFieldWrapper } from '../../../../components/Form';
import { FormItemProps } from 'antd/lib/form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';

export interface LogoInputProps {
  formItemProps?: FormItemProps;
  inputProps?: any;
  helpToolTipProps?: TooltipPropsWithTitle;
}

class LogoInput extends React.Component<LogoInputProps & WrappedFieldProps> {
  render() {
    const {
      meta,
      formItemProps,
      inputProps,
      helpToolTipProps,
      input,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';
    return (
    <FormFieldWrapper
      helpToolTipProps={helpToolTipProps}
      validateStatus={validateStatus}
      {...formItemProps}
    >
      <EditableLogo id="editable_logo" mode="inline" 
        {...input}
        {...inputProps}
      />
    </FormFieldWrapper>);
  }
}

export default LogoInput;
