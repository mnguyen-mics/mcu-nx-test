import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { Input } from 'antd';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { InputProps } from 'antd/lib/input';

export interface OptionsProps {
  label: string;
  value: string;
}

export interface FormLinkedTextInputProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  leftFormInput: InputProps;
  rightFormInput: InputProps;
  small?: boolean;
}

type JoinedProps = FormLinkedTextInputProps & WrappedFieldProps;

class FormLinkedTextInput extends React.Component<JoinedProps> {
  updateLeftSelect = (e: any) => {
    const { input } = this.props;
    input.onChange({ ...input.value, leftValue: e.target.value });
  };
  updateRightInput = (e: any) => {
    const { input } = this.props;
    input.onChange({ ...input.value, rightValue: e.target.value });
  };

  render() {
    const {
      input,
      meta,
      formItemProps,
      helpToolTipProps,
      renderFieldAction,
      leftFormInput,
      rightFormInput,
      small,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        renderFieldAction={renderFieldAction}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <div className='range-filter'>
          <div className='filter-input'>
            <Input
              value={input.value.leftValue}
              onChange={this.updateLeftSelect}
              {...leftFormInput}
            />
          </div>
          <div className='range-filter-separator'>
            <p className='form-split'>=</p>
          </div>
          <div className='filter-input'>
            <Input
              value={input.value.rightValue}
              onChange={this.updateRightInput}
              {...rightFormInput}
            />
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormLinkedTextInput;
