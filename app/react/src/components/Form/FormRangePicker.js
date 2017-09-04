import React from 'react';
import PropTypes from 'prop-types';
import { Form, DatePicker, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

const FormRangePicker = ({
  endInput,
  formItemProps: { endDate, ...otherFormItemProps },
  startInput,
  helpToolTipProps,
}) => {

  return (
    <Form.Item
      help={false /* TODO */}
      validateStatus={'' /* TODO */}
      {...otherFormItemProps}
    >
      <Row align="middle">
        <div className="form-range-picker-wrapper">
          <DatePicker className="form-range-picker-width" {...startInput} />

          <p className="form-range-picker-dash-separator">-</p>

          <DatePicker className="form-range-picker-width" {...endInput} />

          {!isEmpty(helpToolTipProps) &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...helpToolTipProps} placement="right">
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          }
        </div>
      </Row>
    </Form.Item>
  );
};

FormRangePicker.defaultProps = {
  endInput: {},
  formItemProps: {},
  startInput: {},
  helpToolTipProps: {},
};

FormRangePicker.propTypes = {
  endInput: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.stringz,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    // name: PropTypes.string
  }),
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    colon: PropTypes.bool
  }),
  startInput: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.stringz,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    // name: PropTypes.string
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
};

export default FormRangePicker;
