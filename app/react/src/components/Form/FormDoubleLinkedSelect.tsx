import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { Select } from 'antd';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import FormSelect, { FormSelectProps } from './FormSelect/FormSelect';
// import { Omit } from '../../utils/Types';

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
  leftFormSelectProps: FormSelectProps;
  rightFormSelectProps: FormSelectProps;
  optionsProps: DoubleLinkedSelectOptionsProps;
}

type JoinedProps = FormDoubleLinkedSelectProps & WrappedFieldProps;

class FormDoubleLinkedSelect extends React.Component<JoinedProps> {

  updateLeftSelect = (leftValue: string) => {
    const { input } = this.props;
    // const { rightOptions } = optionsProps;
    input.onChange({ leftValue: leftValue });
  }
  updateRightSelect = (rightValue: string) => {
    const { input } = this.props;
    input.onChange({ ...input.value, rightValue: rightValue });
  }

  createLeftOptions = () => {
    const { optionsProps } = this.props;
    const leftOptions = optionsProps.leftOptions.map(option => (<Select.Option key={option.value}>{option.label}</Select.Option>));
    return leftOptions;
  }

  createRightOptions = (leftValue?: string) => {
    const { optionsProps } = this.props;
    if (!leftValue) {
      return [];
    }
    const rightOptions = optionsProps.rightOptions[leftValue].map(
      option => (<Select.Option key={option.value}>{option.label}</Select.Option>));
    return rightOptions;
  }

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
        <div className="double-select">
          <div className="select">
            <FormSelect
              children={leftOptions}
              value={input.value.leftValue}
              onChange={this.updateLeftSelect}
              {...leftFormSelectProps}
            />
          </div>
          <div className="double-select-separator">
            <p className="ant-form-split">=</p>
          </div>
          <div className="select">
            <FormSelect
              children={rightOptions}
              value={input.value.rightValue}
              onChange={this.updateRightSelect}
              {...rightFormSelectProps}
            />
          </div>
        </div>
      </FormFieldWrapper>
    );
  }

}

export default FormDoubleLinkedSelect;
