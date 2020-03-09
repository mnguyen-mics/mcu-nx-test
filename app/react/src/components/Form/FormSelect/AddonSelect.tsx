import * as React from 'react';
import cuid from 'cuid';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { OptionProps } from 'antd/lib/select';
import { RestrictedSelectProps } from './DefaultSelect';

const { Option } = Select;

export interface FormSelectAddonProps {
  selectProps?: RestrictedSelectProps;
  options: OptionProps[];
  style?: React.CSSProperties;
  disabled?: boolean;
}

class AddonSelect extends React.Component<
  FormSelectAddonProps & WrappedFieldProps
> {
  static defaultProps: Partial<FormSelectAddonProps & WrappedFieldProps> = {
    style: { width: 100 },
    disabled: false,
  };

  render() {
    const { selectProps, input, style, options, disabled } = this.props;

    const formValue = input.value || options[0];
    const filteredOptions = options.filter(
      option => option.value !== formValue.key,
    );

    const optionsToDisplay = filteredOptions.map(option => (
      <Option key={option.key || cuid()} {...option}>
        {option.title || option.children}
      </Option>
    ));

    return (
      <Select
        id={input.name}
        onBlur={input.onBlur as () => any}
        onChange={input.onChange as () => any}
        onFocus={input.onFocus as () => any}
        value={input.value}
        {...selectProps}
        style={{ display: 'flex', justifyContent: 'center', ...style }}
        disabled={disabled}
      >
        {optionsToDisplay}
      </Select>
    );
  }
}

export default AddonSelect;
