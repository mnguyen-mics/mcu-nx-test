import * as React from 'react';
import { Select } from 'antd';
// import { WrappedFieldInputProps } from 'redux-form';
import { SelectProps } from 'antd/lib/select';

import { generateFakeId } from '../../../utils/FakeIdHelper';

export interface FormSelectProps extends SelectProps {}

const FormSelect: React.SFC<FormSelectProps> = props => {

  const {
    children,
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
        {...otherProps}
      >
        {children}
      </Select>
    </div>
  );
};

export default FormSelect;
