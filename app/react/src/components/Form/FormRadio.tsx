import React from 'react';
import { Radio } from 'antd';
import { RadioProps } from 'antd/lib/radio/radio';

interface FormRadioProps {
  title: string;
}

const FormCheckbox: React.SFC<RadioProps & FormRadioProps> = props => {

  const { title, ...otherProps } = props;

  return <Radio {...otherProps}>{title}</Radio>;
};

export default FormCheckbox;
