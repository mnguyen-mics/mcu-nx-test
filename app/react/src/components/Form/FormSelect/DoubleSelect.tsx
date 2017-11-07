import * as React from 'react';
import { Input, Select } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import ButtonStyleless from '../../ButtonStyleless';

interface CustomProps {
  label: string;
  onClick: () => any;
}

interface FormSelectProps {
  formItemProps?: FormItemProps;
  customProps: CustomProps;
  options?: OptionProps[];
  selectProps?: SelectProps;
}

class DoubleSelect extends React.Component<FormSelectProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
    formItemProps: {},
    helpToolTipProps: {},
    options: [],
    selectProps: {},
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
      customProps,
      formItemProps,
      helpToolTipProps,
      firstInputProps,
      secondInputProps,
      // input,
      // meta,
    } = this.props;

    const validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    // if (meta.touched && meta.invalid) validateStatus = 'error';
    // if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    return (
        <FormFieldWrapper
          help={/*meta.touched && (meta.warning || meta.error)*/''}
          helpToolTipProps={helpToolTipProps}
          validateStatus={validateStatus}
          {...formItemProps}
        >
          <div className="custom-select">
            <div className="double-select">
              <div className="select"><Input{...firstInputProps} /></div>
              <div className="separator">-</div>
              <div className="select"><Input {...secondInputProps} /></div>
            </div>

            <div className="button">
              <ButtonStyleless
                className="clickable-on-hover"
                onClick={customProps.onClick}
              >{customProps.label}
              </ButtonStyleless>
            </div>
          </div>
        </FormFieldWrapper>
    );
  }
}

export default DoubleSelect;
