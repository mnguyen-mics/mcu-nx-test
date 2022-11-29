import * as React from 'react';
import { Checkbox } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { WrappedFieldProps } from 'redux-form';

export type FormCheckboxProps = CheckboxProps & WrappedFieldProps;

const FormCheckbox: React.SFC<FormCheckboxProps> = props => {
  const {
    input: { onChange, value },
    children,
    ...otherProps
  } = props;

  const checked = !!value;
  const handleOnChange = () => onChange(!checked);

  return (
    <Checkbox {...otherProps} checked={checked} onChange={handleOnChange}>
      {children}
    </Checkbox>
  );
};

export default FormCheckbox;
