import * as React from 'react';
import { Input } from 'antd';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TextAreaProps } from 'antd/lib/input/TextArea';
import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormTextAreaProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: TextAreaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  helpToolTipProps?: TooltipPropsWithTitle;
  small?: boolean;
}

const FormTextArea: React.SFC<FormTextAreaProps & WrappedFieldProps> = props => {
  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      small={props.small}
      {...props.formItemProps}
    >
      <Input.TextArea id={props.input.name} {...props.input} {...props.inputProps} />
    </FormFieldWrapper>
  );
};

FormTextArea.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: { title: '' },
};

export default FormTextArea;
