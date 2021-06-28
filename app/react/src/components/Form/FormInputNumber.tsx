import * as React from 'react';

// TS Interfaces
import { InputNumber } from 'antd';
import { InputNumberProps } from 'antd/lib/input-number';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormInputNumberProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputNumberProps?: InputNumberProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  small?: boolean;
}

const FormInputNumber: React.FunctionComponent<
  FormInputNumberProps & WrappedFieldProps
> = props => {
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
      <InputNumber
        className='mcs-formInputNumber'
        id={props.input.name}
        {...props.input}
        {...props.inputNumberProps}
      />
    </FormFieldWrapper>
  );
};

export default FormInputNumber;
