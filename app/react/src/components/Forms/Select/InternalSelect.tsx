import * as React from 'react';
import { Select } from 'antd';

interface InternalSelectProps {
  defaultValue?: string;
  input?: {
    onChange: Function;
  };
  meta: object;
}

class InternalSelect extends React.Component<InternalSelectProps> {

  static defaultProps = {
    defaultValue: undefined,
    input: ['form-control'],
  }
  
  constructor(props) {
    super(props);
    const {
      input: { onChange },
      defaultValue,
      children,
    } = this.props;

    const firstValue = defaultValue ? defaultValue : children[0].props.value;

    onChange(firstValue);
  }

  render() {
    const {
      input: { onChange },
      children,
      ...other
    } = this.props;

    return (
      <Select {...other} onSelect={value => onChange(value)} >
        {children}
      </Select>
    );
  }
}

export default InternalSelect;

