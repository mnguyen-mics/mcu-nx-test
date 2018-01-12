import * as React from 'react';

// TS Interfaces
import AceEditor from 'react-ace';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { AceEditorProps } from 'react-ace/types'
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormCodeEditProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: AceEditorProps;
  helpToolTipProps?: TooltipProps;
}

const FormCodeEdit: React.SFC<FormCodeEditProps & WrappedFieldProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';
  const onBlur = () => props.input.onBlur(undefined);
  const onFocus = () => props.input.onFocus(undefined!);

  return (
    <FormFieldWrapper
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      helpToolTipProps={props.helpToolTipProps}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >
      <AceEditor
        value={props.input.value}
        {...props.inputProps}
        theme="monokai"
        name={props.input.name}
        onBlur={onBlur}
        onFocus={onFocus}
        width={'100%'}
        onChange={props.input.onChange}
      />
    </FormFieldWrapper>
  );
};


export default FormCodeEdit;
