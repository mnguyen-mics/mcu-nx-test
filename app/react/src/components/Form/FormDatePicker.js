import React from 'react';
import PropTypes from 'prop-types';
import { Form, DatePicker, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

const defaultTooltipPlacement = 'right';

function FormDatePicker({
  datePickerProps,
  formItemProps: { endDate, ...otherFormItemProps },
  helpToolTipProps,
  input: { value, ...otherInputProps },
  meta,
  secondDatePickerProps,
}) {
  let validateStatus = '';
  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(helpToolTipProps);

  const mergedTooltipProps = {
    placement: defaultTooltipPlacement,
    ...helpToolTipProps,
  };

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  const correctedInput = (value === ''
    ? { ...otherInputProps }
    : { ...otherInputProps, value }
  );

  return (
    <Form.Item
      help={meta.touched && (meta.warning || meta.error)}
      validateStatus={validateStatus}
      {...otherFormItemProps}
    >

      {/* <Row align="middle"> */}
      <div>
        <DatePicker
          id={correctedInput.name}
          {...correctedInput}
          {...datePickerProps}
        />
        {/* endDate && <p style={{ fontWeight: 'bold', margin: '15px 15px' }}>-</p> */}
        {/* endDate &&
        <DatePicker
          id={correctedInput.name}
          {...correctedInput}
          {...secondDatePickerProps}
        />
          */}

      </div>
      {/* </Row> */}
    </Form.Item>
  );
}

FormDatePicker.defaultProps = {
  datePickerProps: {},
  formItemProps: {},
  helpToolTipProps: {},
  input: {},
  meta: {},
  secondDatePickerProps: {},
};

FormDatePicker.propTypes = {
  datePickerProps: PropTypes.shape({
    format: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    placeholder: PropTypes.stringz,
  }),
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    colon: PropTypes.bool
  }),
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf([
      'top',
      'left',
      'right',
      'bottom',
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom'
    ])
  }),
  input: PropTypes.shape({
    name: PropTypes.string
  }),
  meta: PropTypes.shape({
    error: PropTypes.string
  }),
  secondDatePickerProps: PropTypes.shape({
    format: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    placeholder: PropTypes.stringz
  }),
};

export default FormDatePicker;
