import * as React from 'react';
import { Slider } from 'antd';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper from './FormFieldWrapper';
import { SliderSingleProps } from 'antd/lib/slider';

export interface FormSliderProps {
  formItemProps?: FormItemProps;
  inputProps?: SliderSingleProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  small?: boolean;
}

class FormSlider extends React.Component<FormSliderProps & WrappedFieldProps> {
  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  onChange = (checked: boolean) => {
    const { input } = this.props;
    input.onChange(checked);
    this.setState({
      checked: checked,
    });
  };

  render() {
    const { meta, formItemProps, inputProps, helpToolTipProps, input, small } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Slider className='mcs-formSlider' {...input} {...inputProps} />
      </FormFieldWrapper>
    );
  }
}

export default FormSlider;
