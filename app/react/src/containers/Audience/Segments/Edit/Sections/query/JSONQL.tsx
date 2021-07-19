import * as React from 'react';
import { FormItemProps } from 'antd/lib/form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';
import AdvancedSegmentBuilderPreview, {
  AdvancedSegmentBuilderPreviewProps,
} from '../../../../AdvancedSegmentBuilder/AdvancedSegmentBuilderPreview';

export interface JSONQLInputEditorProps {
  formItemProps?: FormItemProps;
  inputProps: AdvancedSegmentBuilderPreviewProps;
  helpToolTipProps?: TooltipPropsWithTitle;
}

class JSONQLInputEditor extends React.Component<JSONQLInputEditorProps & WrappedFieldProps> {
  render() {
    return (
      <AdvancedSegmentBuilderPreview
        value={this.props.input.value}
        {...this.props.inputProps}
        onChange={this.props.input.onChange}
      />
    );
  }
}

export default JSONQLInputEditor;
