import * as React from 'react';

// TS Interfaces
import AceEditor from 'react-ace';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { AceEditorProps } from 'react-ace/types'
import 'brace/ext/searchbox'
import { WrappedFieldProps } from 'redux-form';
import 'brace/theme/github';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormCodeEditProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: AceEditorProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  disabled?: boolean;
  small?: boolean;
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
      small={props.small}
      {...props.formItemProps}
      className="mcs-formFieldWrapper_codeEdit"
    >
      <AceEditor
        value={props.input.value}
        {...props.inputProps}
        theme="github"
        name={props.input.name}
        onBlur={onBlur}
        onFocus={onFocus}
        width={'100%'}
        onChange={props.input.onChange}
        readOnly={props.disabled}
        showPrintMargin={false}
      />
    </FormFieldWrapper>
  );
};


export default FormCodeEdit;
