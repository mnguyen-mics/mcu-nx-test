import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Select as AntSelect } from 'antd';
import InternalSelect from './InternalSelect';

class Select extends Component {


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


Select.propTypes = {
  defaultValue: PropTypes.string,
  selectClassNames: PropTypes.arrayOf(PropTypes.string)
};

Select.defaultProps = {
  defaultValue: undefined,
  selectClassNames: ['form-control']
};

export default Select;
