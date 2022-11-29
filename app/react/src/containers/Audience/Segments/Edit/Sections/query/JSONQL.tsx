import * as React from 'react';
import { FormItemProps } from 'antd/lib/form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';
import SegmentBuilderPreview, {
  SegmentBuilderPreviewProps,
} from '../../../../AdvancedSegmentBuilder/SegmentBuilderPreview';

export interface JSONQLInputEditorProps {
  formItemProps?: FormItemProps;
  inputProps: SegmentBuilderPreviewProps;
  helpToolTipProps?: TooltipPropsWithTitle;
}

class JSONQLInputEditor extends React.Component<JSONQLInputEditorProps & WrappedFieldProps> {
  render() {
    return (
      <SegmentBuilderPreview
        value={this.props.input.value}
        {...this.props.inputProps}
        onChange={this.props.input.onChange}
      />
    );
  }
}

export default JSONQLInputEditor;
