import * as React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Select as AntSelect } from 'antd';

import InternalSelect from './InternalSelect';

interface SelectProps {
  defaultValue: string;
  selectClassNames: Array<string>;
  other: object;
}

class Select extends React.Component<SelectProps, {}> {

  static Option = AntSelect.Option;

  static defaultprops = {
  defaultValue: undefined,
  selectClassNames: ['form-control'],
  }

  render() {
    const {
      children,
      ...other
    } = this.props;

    return (
      <Field name="" component={InternalSelect} {...other}>
        {children}
      </Field>
    );
  }
}

export default Select;
