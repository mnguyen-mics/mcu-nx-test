import * as React from 'react';
import { Select, Col } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { generateFakeId } from '../../utils/FakeIdHelper';

interface FormSelectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps;
  options?: OptionProps[];
  disabled?: boolean;
}

const Option = Select.Option;

class FormSelect extends React.Component<FormSelectProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultprops: Partial<FormSelectProps> = {
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
      disabled,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const optionsToDisplay = options!.map(option => (
      <Option key={option.value} value={option.value}>{option.title}</Option>
    ));

    const selectId = generateFakeId();
    const getPopupContainer = (triggerNode: Element) => {
      return document.getElementById(selectId) as any;
    };

    return (
        <FormFieldWrapper
          help={meta.touched && (meta.warning || meta.error)}
          helpToolTipProps={helpToolTipProps}
          validateStatus={validateStatus}
          {...formItemProps}
        >
          <Col span={22}>
            <div id={selectId}>
              <Select
                {...selectProps}
                getPopupContainer={getPopupContainer}
                onChange={onChange}
                // difficulties to map some WrappedFieldInputProps with SelectProps
                onBlur={onChange as () => any}
                onFocus={onFocus as () => any}
                value={value}
                disabled={disabled}
              >
                {optionsToDisplay}
              </Select>
            </div>
          </Col>
        </FormFieldWrapper>
    );
  }
}

export default FormSelect;
