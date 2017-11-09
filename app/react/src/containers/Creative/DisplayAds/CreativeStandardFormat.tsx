import * as React from 'react';
import { Select } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../../components/Form/FormFieldWrapper';
import FormSelect from '../../../components/Form/FormSelect/FormSelect';
import ButtonStyleless from '../../../components/ButtonStyleless';

interface ButtonProps {
  label: string;
  onClick: () => any;
}

interface StandardFormatProps {
  formItemProps?: FormItemProps;
  button: ButtonProps;
  options?: OptionProps[];
  select?: SelectProps;
}

const Option = Select.Option;

class CreativeStandardFormat extends React.Component<StandardFormatProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
    formItemProps: {},
    helpToolTipProps: {},
    options: [],
    select: {},
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
      button,
      helpToolTipProps,
      options,
      select,
      input,
      meta,
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
          <div className="creative-format">
            <div className="standard">
              <FormSelect
                {...select}
                input={input}
              >{optionsToDisplay}
              </FormSelect>
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

export default CreativeStandardFormat;
