import React from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import FormSelect from './FormSelect';

const Option = Select.Option;

interface FormTagSelectProps {
  formItemProps: FormItemProps;
  selectProps?: SelectProps & { options: [{ label: string, value: string }] };
}

const TagSelect: React.SFC<FormTagSelectProps & FormFieldWrapperProps & WrappedFieldProps> = props => {

  const {
    formItemProps,
    helpToolTipProps,
    input,
    meta,
    selectProps,
  } = props;

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  const mode = 'multiple' as 'multiple' | 'tags' | 'combobox';

  if (meta.touched && meta.invalid) {
    validateStatus = 'error';
  }
  if (meta.touched && meta.warning) {
    validateStatus = 'warning';
  }

  const optionsToDisplay = selectProps!.options.map(({ label, ...option }) => (
    <Option {...option} key={option.value}>{label}</Option>
  ));

  return (
    <FormFieldWrapper
      help={meta.touched && (meta.warning || meta.error)}
      helpToolTipProps={helpToolTipProps}
      validateStatus={validateStatus}
      {...formItemProps}
    >
      <FormSelect
        {...selectProps}
        input={input}
        mode={mode}
        onBlur={input.onBlur as () => any}
        value={input.value || []}
      >{optionsToDisplay}
      </FormSelect>
    </FormFieldWrapper>
  );
};

export default TagSelect;
