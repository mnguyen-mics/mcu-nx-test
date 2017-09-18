import * as React from 'react';
import { Select } from 'antd';

interface InternalSelectProps {
  defaultValue?: string;
  input?: any;
  meta: any;
}

interface InternalSelectState {

}

class InternalSelect extends React.Component<InternalSelectProps, InternalSelectState> {

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

// InternalSelect.defaultProps = {
//   defaultValue: undefined,
//   input: ['form-control'],
// };
//
// InternalSelect.propTypes = {
//   defaultValue: PropTypes.string,
//   input: PropTypes.shape(),
//   meta: PropTypes.shape().isRequired,
// };

export default InternalSelect;
