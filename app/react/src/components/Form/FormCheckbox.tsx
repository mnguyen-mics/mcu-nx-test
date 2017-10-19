import React from 'react';
import { Checkbox } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { WrappedFieldProps } from 'redux-form';

interface FormCheckboxProps {
  CheckboxProps?: CheckboxProps;
}

const FormCheckbox: React.SFC<FormCheckboxProps & WrappedFieldProps> = props => {

  const { input, ...otherProps } = props;

  return <Checkbox {...otherProps} {...input} />;
};

export default FormCheckbox;
