import * as React from 'react';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormSelect from './FormSelect';

const { Option } = Select;

export interface FormSelectAddonProps {
  selectProps?: SelectProps;
  options: OptionProps[];
  style?: React.CSSProperties;
  disabled?: boolean;
}

class AddonSelect extends React.Component<
  FormSelectAddonProps & WrappedFieldProps
> {
  render() {
    const { selectProps, input, style, options, disabled } = this.props;

    const formValue = input.value || options[0];
    const filteredOptions = options.filter(
      option => option.value !== formValue.key,
    );

    const optionsToDisplay = filteredOptions.map(option => (
      <Option key={option.value} value={option.value}>
        {option.title}
      </Option>
    ));

    return (
      <FormSelect
        onBlur={input.onBlur as () => any}
        onChange={input.onChange as () => any}
        onFocus={input.onFocus as () => any}
        value={input.value}
        {...selectProps}
        style={{ display: 'flex', justifyContent: 'center', ...style }}
        disabled={disabled}
      >
        {optionsToDisplay}
      </FormSelect>
    );
  }
}

export default AddonSelect;
