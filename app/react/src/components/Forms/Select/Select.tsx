import * as React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Select as AntSelect } from 'antd';

import InternalSelect from './InternalSelect';

interface SelectProps {
  defaultValue: any;
  selectClassNames: Array<string>;
}

class Select extends React.Component<SelectProps, {}> {

  static Option = AntSelect.Option;

  render() {
    const {
      children,
      ...other
    } = this.props;

    return (
      <Field component={InternalSelect} {...other}>
        {children}
      </Field>
    );
  }
}
// 
//
// Select.propTypes = {
//   defaultValue: PropTypes.string,
//   selectClassNames: PropTypes.arrayOf(PropTypes.string),
// };

// Select.defaultProps = {
//   defaultValue: undefined,
//   selectClassNames: ['form-control'],
// };

export default Select;
