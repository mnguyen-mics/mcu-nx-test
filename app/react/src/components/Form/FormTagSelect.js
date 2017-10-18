import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { Col, Form, Row, Select, Tooltip } from 'antd';

import McsIcons from '../../components/McsIcons.tsx';

const Option = Select.Option;

function FormTagSelect({
  formItemProps,
  helpToolTipProps,
  input,
  meta,
  selectProps,
}) {

  const displayOptions = selectProps.options.map(({ label, value, ...rest }) => (
    <Option {...rest} key={value} value={String(value)}>{label}</Option>
  ));

  const value = input.value || [];

  let validateStatus = 'success';

  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

  const mergedTooltipProps = {
    placement: 'right',
    ...helpToolTipProps,
  };

  const { label, ...otherFormItemProps } = formItemProps;

  return (
    <Form.Item
      help={meta.touched && (meta.warning || meta.error)}
      validateStatus={validateStatus}
      label={<span className="field-label">{label}</span>}
      {...otherFormItemProps}
    >
      <Row align="middle" type="flex">
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

        {!isEmpty(helpToolTipProps) &&
          <Col span={2} className="field-tooltip">
            <Tooltip {...mergedTooltipProps}>
              <McsIcons type="info" />
            </Tooltip>
          </Col>
        }
      </Row>
    </Form.Item>
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
