import * as React from 'react';
import { SelectProps } from 'antd/lib/select';
import { Select } from '../../PopupContainers';

export interface FormSelectProps extends SelectProps {}

const FormSelect: React.SFC<FormSelectProps> = props => {
  const { children, ...otherProps } = props;

  return <Select {...otherProps}>{children}</Select>;
};

export default FormSelect;
