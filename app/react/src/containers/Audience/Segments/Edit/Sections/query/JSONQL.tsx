import * as React from 'react';
import { FormItemProps } from 'antd/lib/form';
import { TooltipProps } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';
import JSONQLPreview, { JSONQLPreviewProps } from '../../../../../../containers/QueryTool/JSONOTQL/JSONQLPreview';


export interface JSONQLInputEditorProps {
  formItemProps?: FormItemProps;
  inputProps: JSONQLPreviewProps;
  helpToolTipProps?: TooltipProps;
}

class JSONQLInputEditor extends React.Component<JSONQLInputEditorProps & WrappedFieldProps> {

  render() {


    return (
        <JSONQLPreview
          value={this.props.input.value}
          datamartId={this.props.inputProps.datamartId}
          {...this.props.inputProps}
          onChange={this.props.input.onChange}
          isTrigger={this.props.inputProps.isTrigger}
          isEdge={this.props.inputProps.isEdge}
        />
    );
  }
}

export default JSONQLInputEditor;
