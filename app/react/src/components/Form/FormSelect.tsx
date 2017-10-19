import * as React from 'react';
import { Select, Col } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

interface FormSelectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps;
  options?: OptionProps[];
}

const Option = Select.Option;

class FormSelect extends React.Component<FormSelectProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultprops = {
    formItemProps: {},
    selectProps: {},
    options: [],
    helpToolTipProps: {},
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
      input: {
        value,
        onChange,
      },
    } = this.props;

    if (options && options.length === 1 && (!value || value === '')) {
      onChange(options[0].value);
    }
  }

  render() {
    const {
      input: { value, onChange, onFocus },
      meta,
      formItemProps,
      selectProps,
      options,
      helpToolTipProps,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const optionsToDisplay = options!.map(option => (
      <Option key={option.value} value={option.value}>{option.title}</Option>
    ));

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <Col span={22}>
          <Select
            {...selectProps}
            value={value}
            onChange={onChange}
            // difficulties to map some WrappedFieldInputProps with SelectProps
            onBlur={onChange as () => any}
            onFocus={onFocus as () => any}
          >
            {optionsToDisplay}
          </Select>
        </Col>
      </FormFieldWrapper>
    );
  }
}

export default FormSelect;
