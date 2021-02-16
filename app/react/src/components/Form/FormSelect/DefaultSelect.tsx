import * as React from 'react';
import { Select } from 'antd';
import cuid from 'cuid';
// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import FormFieldWrapper, { FormFieldWrapperProps } from '../FormFieldWrapper';
import { Omit } from '../../../utils/Types';
import { defineMessages, FormattedMessage } from 'react-intl';

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
  autoSetDefaultValue?: boolean;
  defaultValueTitle?: string;
}

const Option = Select.Option;

const messages = defineMessages({
  defaultValue: {
    id: 'components.form.formSelect.defaultSelect.defaultValue',
    defaultMessage: '- Select One -',
  },
});

type Props = DefaultSelectProps & WrappedFieldProps;

interface State {
  didMount: boolean;
}

class DefaultSelect extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    formItemProps: {},
    selectProps: {},
    options: [],
    disabled: false,
    autoSetDefaultValue: true,
  };

  id: string = cuid();

  constructor(props: Props) {
    super(props);
    this.state = { didMount: false };
  }

  componentDidMount() {
    this.setState({
      didMount: true,
    });
    if (this.props.autoSetDefaultValue) {
      this.setDefaultValue();
    }
  }

  componentDidUpdate() {
    if (this.props.autoSetDefaultValue) {
      this.setDefaultValue();
    }
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
      defaultValueTitle,
    } = this.props;

    const { didMount } = this.state;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const optionsToDisplay = options!.map(option => (
      <Option key={cuid()} {...option}>
        {option.title || option.children}
      </Option>
    ));

    const defaultOption = (
      <Option value={''}>
        {defaultValueTitle || <FormattedMessage {...messages.defaultValue} />}
      </Option>
    );
    const getRef = () => document.getElementById(this.id)!;

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <div id={this.id} style={{ width: '100%' }}>
          {didMount && (
            <Select
              {...selectProps}
              onBlur={input.onBlur as () => any}
              onChange={input.onChange as () => any}
              onFocus={input.onFocus as () => any}
              value={input.value}
              disabled={disabled}
              getPopupContainer={getRef}
            >
              {defaultOption}
              {optionsToDisplay}
            </Select>
          )}
        </div>
      </FormFieldWrapper>
    );
  }
}

export default DefaultSelect;
