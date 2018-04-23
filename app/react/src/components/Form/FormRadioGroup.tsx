import * as React from 'react';
import { Radio } from 'antd';
import { RadioProps, RadioGroupProps } from 'antd/lib/radio';
import { WrappedFieldProps } from 'redux-form';

export interface FormRadioGroupProps {
  radioGroupProps?: RadioGroupProps;
  options: Array<RadioProps & { label: string }>;
}

const RadioGroup = Radio.Group;

class FormRadioGroup extends React.Component<
  FormRadioGroupProps & WrappedFieldProps
> {
  render() {
    const { options, input, radioGroupProps } = this.props;

    const optionsToMap = options.map(option => (
      <Radio
        key={option.value}
        value={option.value}
        checked={option.checked}
        disabled={option.disabled}
      >
        {option.label}
      </Radio>
    ));

    return (
      <RadioGroup {...input} {...radioGroupProps}>
        {optionsToMap}
      </RadioGroup>
    );
  }
}

export default FormRadioGroup;
