import * as React from 'react';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { OptionProps } from 'antd/lib/select';

const { Option } = Select;
import { generateFakeId } from '../../utils/FakeIdHelper';

interface FormSelectAddonProps {
  options: OptionProps[];
  style: React.CSSProperties;
}

const FormSelectAddon: React.SFC<FormSelectAddonProps & WrappedFieldProps> = props => {

  const {
    input: { value, onChange, onFocus },
    style,
    options,
  } = props;

  const formValue = value || options[0];
  const filteredOptions = options.filter(option => option.value !== formValue.key);

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
  style: { width: 100 },
};

export default FormSelectAddon;
