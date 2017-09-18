import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

interface FormInputsProps {
  input: [{
    name: string;
  }];
  meta: any;
  formItemProps: object;
  required?: boolean;
  label?: any;
  colon?: boolean;
  // formItemProps?: [{
  //
  // }];
  inputProps: object;
  type?: string;
  placehodler?: string;
  size?: 'small' | 'default' | 'large';
  className?: string;
  // inputProps?: [{
  //   type?: string;
  //   placehodler?: string;
  //   size?: 'small' | 'default' | 'large';
  //   className?: string;
  // }];
  datePickerProps?: object;
  format?: string;
  showTime?: any;
  // datePickerProps?: [{
  //   format?: string;
  //   showTime?: any;
  //   placehodler?: string;
  // }];
  helpToolTipProps?: any;
  title?: string;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft'| 'topRight' | 'bottomLeft'| 'bottomRight' | 'leftTop' | 'leftBottom'| 'rightTop' | 'rightBottom';
  // helpToolTipProps?: [{
  //   title?: string;
  //   placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft'| 'topRight' | 'bottomLeft'| 'bottomRight' | 'leftTop' | 'leftBottom'| 'rightTop' | 'rightBottom';
  // }];
  value?: string;
  otherInputProps?: any;
}

const defaultTooltipPlacement = 'right';

const FormInput: React.SFC<FormInputsProps> = props => {

  let validateStatus = '';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(props.helpToolTipProps);

  const mergedTooltipProps = {
    placement: defaultTooltipPlacement,
    ...props.helpToolTipProps,
  };

  return (
    <Form.Item
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22} >
          <Input
            id={props.input[name]}
            {...props.input}
            {...props.inputProps}
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
  inputProps: {},
  helpToolTipProps: {},
};

FormInput.propTypes = {

};

export default FormInput;
