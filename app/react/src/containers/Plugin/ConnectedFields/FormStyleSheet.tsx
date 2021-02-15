import * as React from 'react';
import { isEmpty } from 'lodash';
import FormFieldWrapper from '../../../components/Form/FormFieldWrapper';
import { FormItemProps } from 'antd/lib/form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { WrappedFieldProps } from 'redux-form';
import PluginSelectModal from './PluginSelectModal';

interface FormStyleSheetProps {
  formItemProps: FormItemProps;
  options: {
    disabled: boolean;
    pluginVersionId: string;
    organisationId: string;
  };
  helpToolTipProps: TooltipPropsWithTitle;
}

type Props = FormStyleSheetProps & WrappedFieldProps;

class FormStyleSheet extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      meta,
      formItemProps,
      helpToolTipProps,
      input,
      options,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={displayHelpToolTip ? helpToolTipProps : undefined}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <PluginSelectModal input={input} type="stylesheet" options={options} />
      </FormFieldWrapper>
    );
  }
}

export default FormStyleSheet;
