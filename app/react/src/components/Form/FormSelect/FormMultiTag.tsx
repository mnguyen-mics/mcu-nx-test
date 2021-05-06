import * as React from 'react';
import { Select } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';
import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RestrictedSelectProps } from './DefaultSelect';

const Option = Select.Option;

export interface FormMultiTagProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  selectProps?: RestrictedSelectProps & {
    options: Array<{ label: string; value: string; disabled?: boolean }>;
  };
  small?: boolean;
  numericOnly?: boolean;
}

type Props = FormMultiTagProps & WrappedFieldProps & InjectedIntlProps;

const FormMultiTag: React.SFC<Props> = props => {
  const { formItemProps, helpToolTipProps, input, meta, selectProps, small } = props;

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  const mode = 'tags' as 'multiple' | 'tags';

  if (meta.touched && meta.invalid) {
    validateStatus = 'error';
  }
  if (meta.touched && meta.warning) {
    validateStatus = 'warning';
  }

  const optionsToDisplay = selectProps
    ? selectProps.options.map(({ label, ...option }) => (
        <Option {...option} key={option.value} value={option.value}>
          {label}
        </Option>
      ))
    : [];

  return (
    <FormFieldWrapper
      help={meta.touched && (meta.warning || meta.error)}
      helpToolTipProps={helpToolTipProps}
      validateStatus={validateStatus}
      small={small}
      {...formItemProps}
    >
      <Select
        mode={mode}
        onChange={input.onChange}
        onFocus={input.onFocus}
        value={input.value || []}
        {...selectProps}
      >
        {optionsToDisplay}
      </Select>
    </FormFieldWrapper>
  );
};

export default injectIntl(FormMultiTag);
