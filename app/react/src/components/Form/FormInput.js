import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import { formatMetric } from '../../utils/MetricHelper';
import McsIcons from '../../components/McsIcons';

const defaultTooltipPlacement = 'right';

function FormInput({
  input: { value, ...otherInput },
  meta,
  formItemProps,
  inputProps: { type, ...otherInputProps },
  helpToolTipProps,
}) {

  let validateStatus = '';
  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

  const inputValue = (type === 'number' ? formatMetric(value, '0,0') : value);
  const displayHelpToolTip = !isEmpty(helpToolTipProps);

  const mergedTooltipProps = {
    placement: defaultTooltipPlacement,
    ...helpToolTipProps,
  };

  return (
    <Form.Item
      help={meta.touched && (meta.warning || meta.error)}
      validateStatus={validateStatus}
      {...formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22} >
          <Input
            id={otherInput.name}
            {...otherInput}
            {...otherInputProps}
            value={inputValue}
          />
        </Col>
        {displayHelpToolTip &&
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

FormInput.defaultProps = {
  formItemProps: {},
  helpToolTipProps: {},
  inputProps: {},
};

FormInput.propTypes = {
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    colon: PropTypes.bool,
  }),
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf(['top', 'left', 'right', 'bottom',
      'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
      'leftTop', 'leftBottom', 'rightTop', 'rightBottom'])
  }),
  input: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  inputProps: PropTypes.shape({
    type: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string,
  }),
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
};

export default FormInput;
