import * as React from 'react';
import { Rate } from 'antd';
import { RateProps } from 'antd/lib/rate';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';
import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormRateProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  inputProps: Partial<RateProps>;
}

class FormRate extends React.Component<FormRateProps & WrappedFieldProps> {
  render() {
    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (this.props.meta.touched && this.props.meta.invalid) validateStatus = 'error';
    if (this.props.meta.touched && this.props.meta.warning) validateStatus = 'warning';
    return (
      <FormFieldWrapper
        help={this.props.meta.touched && (this.props.meta.warning || this.props.meta.error)}
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        small={this.props.small}
        {...this.props.formItemProps}
      >
        <Rate {...this.props.inputProps} />
      </FormFieldWrapper>
    );
  }
}

export default FormRate;
