import * as React from 'react';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import FormSelect from './FormSelect';
import { injectIntl, InjectedIntlProps } from 'react-intl';

const Option = Select.Option;

export interface FormMultiTagProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  selectProps?: SelectProps & { options: Array<{ label: string, value: string }> };
  small?: boolean;
  numericOnly?: boolean
}

type Props = FormMultiTagProps & WrappedFieldProps & InjectedIntlProps

const FormMultiTag: React.SFC<Props> = props => {

  const {
    formItemProps,
    helpToolTipProps,
    input,
    meta,
    selectProps,
    small,
  } = props;

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  const mode = 'tags' as 'multiple' | 'tags' | 'combobox';

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
      small={small}
      {...formItemProps}
    >
      <FormSelect
        {...selectProps}
        mode={mode}
        onBlur={input.onBlur as () => any}
        onChange={input.onChange as () => any}
        onFocus={input.onFocus as () => any}
        value={input.value || []}
        tokenSeparators={[',']}
      >{optionsToDisplay}
      </FormSelect>
    </FormFieldWrapper>
  );
};

export default injectIntl(FormMultiTag);
