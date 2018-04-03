import * as React from 'react';
import { SelectProps } from 'antd/lib/select';
import { Select } from '../../PopupContainers';

export interface FormSelectProps extends SelectProps {}

class FormSelect extends React.Component<FormSelectProps> {
  render() {
    const { children, ...otherProps } = this.props;

    return <Select {...otherProps}>{children}</Select>;
  }
}

export default FormSelect;
