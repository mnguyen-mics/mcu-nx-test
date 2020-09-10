import * as React from 'react';

// TS Interfaces
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormInputProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  textArea?: boolean;
  small?: boolean;
}

const FormInput: React.SFC<FormInputProps & WrappedFieldProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const InputComponent = props.textArea ? Input.TextArea : Input;

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      small={props.small}
      {...props.formItemProps}
    >
      {/* @ts-ignore */}
      <InputComponent
        id={props.input.name}
        {...props.input}
        {...props.inputProps}
      />
    </FormFieldWrapper>
  );
};

FormInput.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {},
};

export default FormInput;
