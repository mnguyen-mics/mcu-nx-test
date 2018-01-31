import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { Select, Input, Col } from 'antd';
import { SelectProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface OptionsProps {
  label: string;
  value: string;
}

export interface FormLinkedSelectInputProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  leftFormSelectProps: SelectProps;
  leftOptionsProps: OptionsProps[];
}

type JoinedProps = FormLinkedSelectInputProps & WrappedFieldProps;

class FormLinkedSelectInput extends React.Component<JoinedProps> {

  updateLeftSelect = (leftValue: string) => {
    const { input } = this.props;
    input.onChange({ leftValue: leftValue });
  }
  updateRightInput = (e: any) => {
    const { input } = this.props;
    input.onChange({ ...input.value, rightValue: e.target.value });
  }

  createLeftOptions = () => {
    const { leftOptionsProps } = this.props;
    const leftOptions = leftOptionsProps.map(option => (<Select.Option key={option.value}>{option.label}</Select.Option>));
    return leftOptions;
  }

  render() {

    const {
      input,
      meta,
      formItemProps,
      helpToolTipProps,
      leftFormSelectProps,
      renderFieldAction,
    } = this.props;

    const leftOptions = this.createLeftOptions();
    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        renderFieldAction={renderFieldAction}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <Col span={11}>
          <Select
            value={input.value.leftValue}
            onChange={this.updateLeftSelect}
            {...leftFormSelectProps}
          >
            {leftOptions}
          </Select>
        </Col>
        <Col span={2}>
          <p className="ant-form-split">=</p>
        </Col>
        <Col span={11}>
          <Input
            value={input.value.rightValue}
            onChange={this.updateRightInput}
          />
        </Col>
      </FormFieldWrapper>
    );
  }

}

export default FormLinkedSelectInput;
