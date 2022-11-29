import * as React from 'react';
import cuid from 'cuid';
import { Select } from 'antd';
import { WrappedFieldProps } from 'redux-form';
import { DefaultOptionProps, RestrictedSelectProps } from './DefaultSelect';

const { Option } = Select;

export interface FormSelectAddonProps {
  selectProps?: RestrictedSelectProps;
  options: DefaultOptionProps[];
  style?: React.CSSProperties;
  disabled?: boolean;
}

interface State {
  didMount: boolean;
}

type Props = FormSelectAddonProps & WrappedFieldProps;

class AddonSelect extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    style: { width: 100 },
    disabled: false,
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
  }

  render() {
    const { selectProps, input, style, options, disabled } = this.props;

    const { didMount } = this.state;

    const formValue = input.value || options[0];
    const filteredOptions = options.filter(option => option.value !== formValue.key);

    const optionsToDisplay = filteredOptions.map(option => (
      <Option key={option.key || cuid()} {...option}>
        {option.children || option.title}
      </Option>
    ));

    const getRef = () => document.getElementById(this.id)!;
    const handleOnBlur = () => input.onBlur(input.value);

    return (
      <span id={this.id} className='mcs-addonSelect'>
        {didMount && (
          <Select
            id={input.name}
            onBlur={handleOnBlur}
            onChange={input.onChange}
            onFocus={input.onFocus}
            value={input.value}
            {...selectProps}
            style={{ display: 'flex', justifyContent: 'center', ...style }}
            disabled={disabled}
            getPopupContainer={getRef}
          >
            {optionsToDisplay}
          </Select>
        )}
      </span>
    );
  }
}

export default AddonSelect;
