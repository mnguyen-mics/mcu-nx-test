import * as React from 'react';
// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipProps } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { InputProps } from 'antd/lib/input/Input';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormCodeSnippetProps extends FormFieldWrapperProps {
  language: string;
  codeSnippet: string;
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  hoverToolTipProps?: TooltipProps;
}

const FormCodeSnippet: React.SFC<FormCodeSnippetProps & WrappedFieldProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  return (
    <div>
      <FormFieldWrapper
        help={props.meta.touched && (props.meta.warning || props.meta.error)}
        helpToolTipProps={props.helpToolTipProps}
        hoverToolTipProps={props.hoverToolTipProps}
        validateStatus={validateStatus}
        {...props.formItemProps}
        {...props.inputProps}
        
      >
        <SyntaxHighlighter language={props.language} style={docco}
          id={props.input.name}
          {...props.input}
          {...props.inputProps}
        >
          {props.codeSnippet}
        </SyntaxHighlighter>
      </FormFieldWrapper>
    </div>
  );
};

FormCodeSnippet.defaultProps = {
  formItemProps: {},
  inputProps:{},
  helpToolTipProps: {},

};

export default FormCodeSnippet;
