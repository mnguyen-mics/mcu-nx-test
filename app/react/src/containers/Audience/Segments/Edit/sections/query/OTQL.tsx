import * as React from 'react';
import { OtqlConsole } from '../../../../../../components';
import FormFieldWrapper, { FormFieldWrapperProps  } from '../../../../../../components/Form/FormFieldWrapper';
import { FormItemProps } from 'antd/lib/form';
import { AceEditorProps } from 'react-ace';
import { TooltipProps } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';


export interface OTQLInputEditorProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  inputProps?: AceEditorProps;
  helpToolTipProps?: TooltipProps;
}

class OTQLInputEditor extends React.Component<OTQLInputEditorProps & WrappedFieldProps> {

  render() {

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

    if (this.props.meta.touched && this.props.meta.invalid) validateStatus = 'error';
    if (this.props.meta.touched && this.props.meta.warning) validateStatus = 'warning';


    return (
      <FormFieldWrapper
        help={this.props.meta.touched && (this.props.meta.warning || this.props.meta.error)}
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        {...this.props.formItemProps}
      >
        <OtqlConsole
          value={this.props.input.value}
          {...this.props.inputProps}
          onChange={this.props.input.onChange}
          showPrintMargin={false}
          height="250px"
          width="100%"
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={true}
        />
      </FormFieldWrapper>
    );
  }
}

export default OTQLInputEditor;
