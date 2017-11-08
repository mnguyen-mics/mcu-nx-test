import * as React from 'react';
import { Input } from 'antd';

// TS Interfaces
import { Field, WrappedFieldInputProps, WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import ButtonStyleless from '../../ButtonStyleless';

interface DoubleProps {
  label: string;
  onClick: () => any;
}

interface FormSelectProps {
  formItemProps?: FormItemProps;
  doubleProps: DoubleProps;
  widthProps: WrappedFieldInputProps;
  heightProps: WrappedFieldInputProps;
}

const Component = (p: any) => {
  const onChange = (e: any) => p.onChange(e.target.value);

  return <Input {...p} onChange={onChange} />;
};

class DoubleSelect extends React.Component<FormSelectProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
    formItemProps: {},
    helpToolTipProps: {},
    options: [],
    selectProps: {},
  };

  render() {
    const {
      doubleProps,
      formItemProps,
      helpToolTipProps,
      widthProps,
      heightProps,
      input,
      meta,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    return (
        <FormFieldWrapper
          help={meta.touched && (meta.warning || meta.error)}
          helpToolTipProps={helpToolTipProps}
          validateStatus={validateStatus}
          {...formItemProps}
        >
          <div className="custom-select">
            <div className="double-select">
              <div className="input">
                <Component
                  placeholder={widthProps.placeholder}
                  value={widthProps.value(input.value)}
                  onChange={widthProps.handleChange(input)}
                />
              </div>
              <div className="separator">x</div>
              <div className="input">
                <Component
                  placeholder={heightProps.placeholder}
                  value={heightProps.value(input.value)}
                  onChange={heightProps.handleChange(input)}
                />
              </div>
            </div>

            <div className="button">
              <ButtonStyleless
                className="clickable-on-hover"
                onClick={doubleProps.onClick}
              >{doubleProps.label}
              </ButtonStyleless>
            </div>
          </div>
        </FormFieldWrapper>
    );
  }
}

export default DoubleSelect;
