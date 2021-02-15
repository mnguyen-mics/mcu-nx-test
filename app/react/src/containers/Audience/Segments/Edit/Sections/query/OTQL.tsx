import * as React from 'react';
import { OtqlConsole } from '../../../../../../components';
import { FormItemProps } from 'antd/lib/form';
import { AceEditorProps } from 'react-ace';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';


export interface OTQLInputEditorProps {
  formItemProps?: FormItemProps;
  inputProps?: AceEditorProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  datamartId: string
}

class OTQLInputEditor extends React.Component<OTQLInputEditorProps & WrappedFieldProps> {

  render() {


    return (
      
        <OtqlConsole
          value={this.props.input.value}
          datamartId={this.props.datamartId}
          {...this.props.inputProps}
          onChange={this.props.input.onChange}
          showPrintMargin={false}
          height="250px"
          width="100%"
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={true}
        />

    );
  }
}

export default OTQLInputEditor;
