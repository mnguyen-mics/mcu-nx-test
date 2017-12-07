import * as React from 'react';
import { Select } from 'antd';
import { WrappedFieldInputProps } from 'redux-form';
import { SelectProps } from 'antd/lib/select';

import { generateFakeId } from '../../../utils/FakeIdHelper';

interface FormSelect {
  input: WrappedFieldInputProps;
  disabled?: boolean;
}

const FormSelect: React.SFC<SelectProps & FormSelect> = props => {

  const {
    children,
    input: { value, onChange, onFocus },
    disabled,
    ...otherProps,
  } = props;

  const selectId = generateFakeId();
  const getPopupContainer = (triggerNode: Element) => {
    return document.getElementById(selectId) as any;
  };

  return (
    <div id={selectId}>
      <Select
        getPopupContainer={getPopupContainer}
        // difficulties to map some WrappedFieldInputProps with SelectProps
        onBlur={onChange as () => any}
        onChange={onChange as () => any}
        onFocus={onFocus as () => any}
        value={value}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </Select>
    </div>
  );
};

export default FormSelect;
