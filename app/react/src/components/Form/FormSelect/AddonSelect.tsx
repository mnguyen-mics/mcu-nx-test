import * as React from 'react';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { OptionProps } from 'antd/lib/select';

import FormSelect from './FormSelect';

const { Option } = Select;

export interface FormSelectAddonProps {
  options: OptionProps[];
  style?: React.CSSProperties;
  disabled?: boolean;
}

const AddonSelect: React.SFC<FormSelectAddonProps & WrappedFieldProps> = props => {

  const {
    input,
    style,
    options,
    disabled,
  } = props;

  const formValue = input.value || options[0];
  const filteredOptions = options.filter(option => option.value !== formValue.key);

  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option.value} value={option.value}>{option.title}</Option>
  ));

  return (
    <FormSelect
      input={input}
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      disabled={disabled}
    >{optionsToDisplay}
    </FormSelect>
  );
};

AddonSelect.defaultProps = {
  style: { width: 100 },
  disabled: false,
};

export default AddonSelect;
