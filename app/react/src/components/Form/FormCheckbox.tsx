import React from 'react';
import { Checkbox } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { WrappedFieldProps } from 'redux-form';

export interface FormCheckboxProps extends CheckboxProps, WrappedFieldProps {
}

const FormCheckbox: React.SFC<FormCheckboxProps> = props => {

  const { input, ...otherProps } = props;

  return <Checkbox {...otherProps} {...input} />;
};

export default FormCheckbox;
