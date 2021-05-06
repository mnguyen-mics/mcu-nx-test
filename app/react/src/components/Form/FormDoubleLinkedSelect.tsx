import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { Select } from 'antd';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { SelectProps } from 'antd/lib/select';

export interface OptionsProps {
  label: string;
  value: string;
}
export interface DoubleLinkedSelectOptionsProps {
  leftOptions: OptionsProps[];
  rightOptions: { [leftOptionValue: string]: OptionsProps[] };
}

export interface FormDoubleLinkedSelectProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  leftFormSelectProps: SelectProps<any>;
  rightFormSelectProps: SelectProps<any>;
  optionsProps: DoubleLinkedSelectOptionsProps;
  small?: boolean;
}

type JoinedProps = FormDoubleLinkedSelectProps & WrappedFieldProps;

class FormDoubleLinkedSelect extends React.Component<JoinedProps> {
  updateLeftSelect = (leftValue: string) => {
    const { input } = this.props;
    input.onChange({ leftValue: leftValue });
  };
  updateRightSelect = (rightValue: string) => {
    const { input } = this.props;
    input.onChange({ ...input.value, rightValue: rightValue });
  };

  createLeftOptions = () => {
    const { optionsProps } = this.props;
    const leftOptions = optionsProps.leftOptions.map(option => (
      <Select.Option key={option.value} value={option.value}>
        {option.label}
      </Select.Option>
    ));
    return leftOptions;
  };

  createRightOptions = (leftValue?: string) => {
    const { optionsProps } = this.props;
    if (!leftValue) {
      return [];
    }
    const rightOptions = optionsProps.rightOptions[leftValue].map(option => (
      <Select.Option key={option.value} value={option.value}>
        {option.label}
      </Select.Option>
    ));
    return rightOptions;
  };

  render() {
    const {
      input,
      meta,
      formItemProps,
      helpToolTipProps,
      leftFormSelectProps,
      rightFormSelectProps,
      renderFieldAction,
    } = this.props;

    const leftOptions = this.createLeftOptions();
    const rightOptions = this.createRightOptions(input.value.leftValue);

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
        <div className='double-select'>
          <div className='select'>
            <Select
              value={input.value.leftValue}
              onChange={this.updateLeftSelect}
              {...leftFormSelectProps}
            >
              {leftOptions}
            </Select>
          </div>
          <div className='double-select-separator'>
            <p className='form-split'>=</p>
          </div>
          <div className='select'>
            <Select
              value={input.value.rightValue}
              onChange={this.updateRightSelect}
              {...rightFormSelectProps}
            >
              {rightOptions}
            </Select>
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormDoubleLinkedSelect;
