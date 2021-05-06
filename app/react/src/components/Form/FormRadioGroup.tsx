import * as React from 'react';
import { Radio } from 'antd';
import { RadioProps, RadioGroupProps } from 'antd/lib/radio';
import { WrappedFieldProps } from 'redux-form';

import FormRadio from './FormRadio';

export interface FormRadioGroupProps {
  radioGroupProps?: RadioGroupProps;
  elements: Array<RadioProps & { id?: string; title: string }>;
  elementClassName?: string;
  disabled?: boolean;
  groupClassName?: string;
  radioButton?: boolean;
}

const RadioGroup = Radio.Group;

const FormRadioGroup: React.SFC<FormRadioGroupProps & WrappedFieldProps> = props => {
  const { elementClassName, groupClassName, elements, input, disabled, radioButton } = props;

  const elementsToMap = elements.map(element => {
    return radioButton ? (
      <Radio.Button key={element.id} value={element.value}>
        {element.title}
      </Radio.Button>
    ) : (
      <FormRadio
        className={elementClassName}
        key={element.id}
        name={element.value}
        title={element.title}
        value={element.value}
      />
    );
  });

  const onChange = (e: any) => input.onChange(e.target.value);

  return (
    <RadioGroup
      {...input}
      className={groupClassName}
      onChange={onChange}
      value={input.value}
      disabled={disabled}
    >
      {elementsToMap}
    </RadioGroup>
  );
};

export default FormRadioGroup;
