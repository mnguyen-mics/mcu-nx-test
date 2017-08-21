import React from 'react';
import PropTypes from 'prop-types';
import { Form, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../../components/McsIcons';
import DateInput from './DateInput';

const correctedInput = (input) => {
  const { value, ...otherInputProps } = input;

  return (value === ''
    ? { ...otherInputProps, id: 'otherInputProps.name1' }
    : { ...otherInputProps, id: 'otherInputProps.name2', value }
  );
};

function FormRangePicker({
  formItemProps,
  startProps,
  endProps,
  helpToolTipProps,
}) {

  const correctedStartProps = correctedInput(startProps);
  const correctedEndProps = correctedInput(endProps);
  const displayHelpToolTip = !isEmpty(helpToolTipProps);

  return (
    <Form.Item {...formItemProps}>
      <Row align="middle" type="flex">
        <Col span={10}>
          <DateInput inputProps={correctedStartProps} />
        </Col>

        <Col span={2}>
          <p className="ant-form-split">-</p>
        </Col>

        <Col span={10}>
          <DateInput inputProps={correctedEndProps} />
        </Col>

        {displayHelpToolTip
          ? (
            <Col span={2} className="field-tooltip">
              <Tooltip {...helpToolTipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          )
          : null
        }
      </Row>
    </Form.Item>
  );
}

FormRangePicker.defaultProps = {
  formItemProps: {},
  startProps: {},
  endProps: {},
  helpToolTipProps: {},
};

FormRangePicker.propTypes = {
  formItemProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    labelCol: PropTypes.shape().isRequired,
    required: PropTypes.bool,
    wrapperCol: PropTypes.shape().isRequired,
  }).isRequired,

  startProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  endProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  helpToolTipProps: PropTypes.shape({
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
      'rightBottom',
    ]),

    title: PropTypes.string,
  }),
};

export default FormRangePicker;
