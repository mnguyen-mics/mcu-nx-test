import * as React from 'react';
import { Input as AntInput } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { InputProps } from 'antd/lib/input/Input';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../../components/Form/FormFieldWrapper';
import ButtonStyleless from '../../../components/ButtonStyleless';

interface ButtonProps {
  label: string;
  onClick: () => any;
}

interface CreativeCustomFormatProps {
  formItemProps?: FormItemProps;
  button: ButtonProps;
  widthProps: InputProps;
  heightProps: InputProps;
}

const Input = (p: any) => {
  const onChange = (e: any) => p.onChange(e.target.value);

  return <AntInput {...p} onChange={onChange} />;
};

class CreativeCustomFormat extends React.Component<CreativeCustomFormatProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
    formItemProps: {},
    helpToolTipProps: {},
  };

  render() {
    const {
      formItemProps,
      button,
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
          <div className="creative-format">
            <div className="custom">
              <div className="input">
                <Input
                  placeholder={widthProps.placeholder}
                  value={widthProps.value(input.value)}
                  onChange={widthProps.handleChange(input)}
                />
              </div>
              <div className="separator">x</div>
              <div className="input">
                <Input
                  placeholder={heightProps.placeholder}
                  value={heightProps.value(input.value)}
                  onChange={heightProps.handleChange(input)}
                />
              </div>
            </div>

            <div className="button">
              <ButtonStyleless
                className="clickable-on-hover"
                onClick={button.onClick}
              >{button.label}
              </ButtonStyleless>
            </div>
          </div>
        </FormFieldWrapper>
    );
  }
}

export default CreativeCustomFormat;
