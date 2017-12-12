import * as React from 'react';

// TS Interfaces
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

<<<<<<< HEAD
export interface FormInputProps extends FormFieldWrapperProps {
=======
export interface FormInputProps {
>>>>>>> 44c26b945d02b0861df3001fdcf4a8f578a8a00c
  formItemProps: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
}

const FormInput: React.SFC<FormInputProps & WrappedFieldProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >
      <Input
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
