import React from 'react';
import PropTypes from 'prop-types';
import { Col, Select, } from 'antd';

import FormFieldWrapper from './FormFieldWrapper';

const Option = Select.Option;

function FormTagSelect({
  formItemProps,
  helpToolTipProps,
  input,
  meta,
  selectProps,
}) {
  let validateStatus = 'success';

  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

  const displayOptions = selectProps.options.map(({ label, value, ...rest }) => (
    <Option {...rest} key={value} value={String(value)}>{label}</Option>
  ));

  const value = input.value || [];

  return (
    <FormFieldWrapper
      help={meta.touched && (meta.warning || meta.error)}
      helpToolTipProps={helpToolTipProps}
      validateStatus={validateStatus}
      {...formItemProps}
    >
      <Col span={22} >
        <Select
          mode="multiple"
          {...input}
          {...selectProps}
          defaultValue={value}
          value={value}
          onChange={values => input.onChange(values)}
        >
          {displayOptions}
        </Select>
      </Col>
    </FormFieldWrapper>
  );
}

FormTagSelect.defaultProps = {
  helpToolTipProps: null,
};

FormTagSelect.propTypes = {
  formItemProps: PropTypes.shape({
    label: PropTypes.string,
    required: PropTypes.bool.isRequired,
  }).isRequired,

  helpToolTipProps: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),

  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string.isRequired),
    ]).isRequired,
  }).isRequired,

  meta: PropTypes.shape({
    error: PropTypes.string,
    invalid: PropTypes.bool,
    touched: PropTypes.bool,
    warning: PropTypes.bool,
  }).isRequired,

  selectProps: PropTypes.shape({
    mode: PropTypes.string,

    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,

    placeholder: PropTypes.string.isRequired,
  }).isRequired,
};

export default FormTagSelect;
