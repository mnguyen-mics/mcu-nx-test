import * as React from 'react';
import { Select, Col } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import FormSelect from './FormSelect';
// import ButtonStyleless from '../../ButtonStyleless';

interface FormSelectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps;
  options?: OptionProps[];
}

const Option = Select.Option;

class DefaultSelect extends React.Component<FormSelectProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
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
      formItemProps,
      helpToolTipProps,
      input,
      meta,
      options,
      selectProps,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const optionsToDisplay = options!.map(option => (
      <Option key={option.value} value={option.value}>{option.title}</Option>
    ));

    // const onClick = () => console.log('dans onClick');

    return (
        <FormFieldWrapper
          help={meta.touched && (meta.warning || meta.error)}
          helpToolTipProps={helpToolTipProps}
          validateStatus={validateStatus}
          {...formItemProps}
        >
          <Col span={22}>
            <FormSelect
              {...selectProps}
              input={input}
              // style={{ width: '90%' }}
            >{optionsToDisplay}
            </FormSelect>
            {/*<ButtonStyleless
              className="clickable-on-hover"
              onClick={onClick}
            >custom
            </ButtonStyleless>*/}
          </Col>
        </FormFieldWrapper>
    );
  }
}

/*<Select
  {...selectProps}
  style={{ width: '90%' }}
  getPopupContainer={getPopupContainer}
  onChange={onChange}
  // difficulties to map some WrappedFieldInputProps with SelectProps
  onBlur={onChange as () => any}
  onFocus={onFocus as () => any}
  value={value}
>*/

export default DefaultSelect;
