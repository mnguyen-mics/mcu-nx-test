import * as React from 'react';

// TS Interfaces
import { Input, Col } from 'antd';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

interface FormInputProps {
  formItemProps: FormItemProps;
  inputProps?: InputProps;
}

const FormInput: React.SFC<FormInputProps & FormFieldWrapperProps & WrappedFieldProps> = props => {

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
      <Col span={22}>
        <Input
          id={props.input.name}
          {...props.input}
          {...props.inputProps}
        />
      </Col>
    </FormFieldWrapper>
  );
};

FormInput.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {},
};

export default FormInput;
