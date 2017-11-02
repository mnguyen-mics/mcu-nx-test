import * as React from 'react';
import { Select } from 'antd';
import { OptionProps, SelectValue} from 'antd/lib/select';

const { Option } = Select;
import { generateFakeId } from '../../utils/FakeIdHelper';

interface FormSelectAddonProps {
  options: OptionProps[];
  style?: React.CSSProperties;
  input: {
    value?: string;
    onChange?: (value: SelectValue) => void;
    onFocus?: (value: SelectValue) => void;
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
  const onFocus = input.onFocus;

  const formValue: SelectValue | any = options[0].value;
  const filteredOptions =  options.filter(option => option.value !== formValue.key);

  const optionsToDisplay = filteredOptions.map(option => (
    <Option key={option.value} value={option.value}>{option.title}</Option>
  ));

  const selectId = generateFakeId();
  const getPopupContainer = (triggerNode: Element) => {
    return document.getElementById(selectId) as any;
  };

  return (
    <div id={selectId}>
      <Select
        getPopupContainer={getPopupContainer}
        onChange={onChange}
        // difficulties to map some WrappedFieldInputProps with SelectProps
        onBlur={onChange as () => any}
        onFocus={onFocus as () => any}
        style={{ display: 'flex', justifyContent: 'center', ...style }}
        value={value}
      >
        {optionsToDisplay}
      </Select>
    </div>
  );
};

FormSelectAddon.defaultProps = {
  input: {
    value: 'INC',
  },
  style: { width: 100 },
};

export default FormSelectAddon;
