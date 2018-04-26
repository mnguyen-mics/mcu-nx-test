import * as React from 'react';
import { Select } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import { Omit } from '../../../utils/Types';

export type RestrictedSelectProps = Omit<
  SelectProps,
  'onChange' | 'value' | 'onBlur' | 'onFocus' | 'defaultValue'
>;

export interface DefaultSelectProps extends FormFieldWrapperProps {
  formItemProps?: FormItemProps;
  selectProps?: RestrictedSelectProps;
  options?: OptionProps[];
  disabled?: boolean;
  small?: boolean;
}

const Option = Select.Option;

class DefaultSelect extends React.Component<
  DefaultSelectProps & WrappedFieldProps
> {
  static defaultProps: Partial<DefaultSelectProps> = {
    formItemProps: {},
    selectProps: {},
    options: [],
    disabled: false,
  };

  componentDidMount() {
    this.setDefaultValue();
  }

  componentDidUpdate() {
    this.setDefaultValue();
  }

  setDefaultValue = () => {
    const {
      options,
      input: { value, onChange },
    } = this.props;

    if (options && options.length === 1 && (!value || value === '')) {
      onChange(options[0].value);
    }
  };

  render() {
    const {
      formItemProps,
      helpToolTipProps,
      disabled,
      input,
      meta,
      options,
      selectProps,
      small,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const optionsToDisplay = options!.map(option => (
      <Option key={option.value} {...option}>
        {option.title}
      </Option>
    ));

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Select
          {...selectProps}
          onBlur={input.onBlur as () => any}
          onChange={input.onChange as () => any}
          onFocus={input.onFocus as () => any}
          value={input.value}
          disabled={disabled}
        >
          {optionsToDisplay}
        </Select>
      </FormFieldWrapper>
    );
  }
}

export default DefaultSelect;
