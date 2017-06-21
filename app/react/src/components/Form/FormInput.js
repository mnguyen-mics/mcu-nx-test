import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import { McsIcons } from '../../components/McsIcons';

const defaultTooltipPlacement = 'right';

const FormInput = (
  { input,
    meta,
    formItemProps,
    inputProps,
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

  return (
    <Form.Item
      help={meta.touched && (meta.warning || meta.error)}
      validateStatus={validateStatus}
      {...formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22} >
          <Input
            id={input.name}
            {...input}
            {...inputProps}
          />
        </Col>
        {displayHelpToolTip &&
          <Col span={2} className="form-tooltip">
            <Tooltip {...mergedTooltipProps}>
              <McsIcons type="info" />
            </Tooltip>
          </Col>
        }
      </Row>
    </Form.Item>
  );
};

FormInput.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {}
};

FormInput.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    colon: PropTypes.bool
  }),
  inputProps: PropTypes.shape({
    type: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string
  }),
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf(['top', 'left', 'right', 'bottom',
      'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
      'leftTop', 'leftBottom', 'rightTop', 'rightBottom'])
  }),
};

export default FormInput;
