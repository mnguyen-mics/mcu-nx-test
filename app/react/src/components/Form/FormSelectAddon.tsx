import * as React from 'react';
import { Select } from 'antd';
import { OptionProps, SelectValue} from 'antd/lib/select';

const { Option } = Select;

interface FormSelectAddonProps {
  options: OptionProps[];
  style?: React.CSSProperties;
  input: {
    value?: string;
    onChange?: (value: SelectValue) => void;
  };
}

const FormSelectAddon: React.SFC<FormSelectAddonProps > = props => {

  const {
    input,
    style,
    options,
  } = props;

  const value = input.value;
  const onChange = input.onChange;

  const formValue: SelectValue | any = options[0].value;
  const filteredOptions =  options.filter(option => option.value !== formValue.key);

  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option.value} value={option.value}>{option.title}</Option>
  ));

  return (
    <Select
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      value={value}
      onChange={onChange}
    >
      {optionsToDisplay}
    </Select>
  );
};

FormSelectAddon.defaultProps = {
  input: {
    value: 'INC',
  },
  style: { width: 100 },
};

export default FormSelectAddon;
