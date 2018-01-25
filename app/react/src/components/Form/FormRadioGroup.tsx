import React from 'react';
import { Radio } from 'antd';
import { RadioProps, RadioGroupProps } from 'antd/lib/radio';
import { WrappedFieldProps } from 'redux-form';

import FormRadio from './FormRadio';

interface FormRadioGroupProps {
  RadioGroupProps?: RadioGroupProps;
  elements: Array<RadioProps & { id: string, title: string }>;
  elementClassName?: string;
  groupClassName?: string;
}

const RadioGroup = Radio.Group;

const FormRadioGroup: React.SFC<FormRadioGroupProps & WrappedFieldProps> = props => {

  const { elementClassName, groupClassName, elements, input } = props;

  const elementsToMap = elements.map(element => (
    <FormRadio
      className={elementClassName}
      key={element.id}
      name={element.value}
      title={element.title}
      value={element.value}
    />
  ));

  const onChange = (e: any) => input.onChange(e.target.value);

  return (
    <RadioGroup
      {...input}
      className={groupClassName}
      onChange={onChange}
      value={input.value}
    >{elementsToMap}
    </RadioGroup>
  );
};

export default FormRadioGroup;
