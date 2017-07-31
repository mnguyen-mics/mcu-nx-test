import React from 'react';
import PropTypes from 'prop-types';
import { Form, DatePicker, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import { McsIcons } from '../../components/McsIcons';

const defaultTooltipPlacement = 'right';

const FormDatePicker = ({
  input: { value, ...otherInputProps },
  meta,
  formItemProps,
  datePickerProps,
  helpToolTipProps
}) => {
  let validateStatus = '';
  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(helpToolTipProps);

  const mergedTooltipProps = {
    placement: defaultTooltipPlacement,
    ...helpToolTipProps
  };

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  const correctedInput = value === ''
    ? {
      ...otherInputProps
    }
    : { ...otherInputProps, value };

  return (
    <Form.Item
      help={meta.touched && (meta.warning || meta.error)}
      validateStatus={validateStatus}
      {...formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22}>
          <DatePicker
            id={correctedInput.name}
            {...correctedInput}
            {...datePickerProps}
          />
        </Col>
        {displayHelpToolTip &&
          <Col span={2} className="field-tooltip">
            <Tooltip {...mergedTooltipProps}>
              <McsIcons type="info" />
            </Tooltip>
          </Col>}
      </Row>
    </Form.Item>
  );
};

FormDatePicker.defaultProps = {
  formItemProps: {},
  datePickerProps: {},
  helpToolTipProps: {}
};

FormDatePicker.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string
  }).isRequired,
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    colon: PropTypes.bool
  }),
  datePickerProps: PropTypes.shape({
    format: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    placeholder: PropTypes.stringz
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
  })
};

export default FormDatePicker;
