import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, DatePicker, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';


interface FormDatePickerProps {
  input: [{
    name: string;
  }];
  meta: any;
  formItemProps: object;
  required?: boolean;
  label?: any;
  colon?: boolean;
  // formItemProps?: [{
  //   required?: boolean;
  //   label?: any;
  //   colon?: boolean;
  // }];
  datePickerProps?: object;
  format?: string;
  showTime?: any;
  placehodler?: string;
  // datePickerProps?: [{
  //   format?: string;
  //   showTime?: any;
  //   placehodler?: string;
  // }];
  helpToolTipProps?: object;
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

const FormDatePicker: React.SFC<FormDatePickerProps> = props => {

// }
//
// function FormDatePicker({
//   input: { value, ...otherInputProps },
//   meta,
//   formItemProps,
//   datePickerProps,
//   helpToolTipProps,
// }) {

  let validateStatus = '';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(props.helpToolTipProps);

  const mergedTooltipProps = {
    placement: defaultTooltipPlacement,
    ...props.helpToolTipProps,
  };

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  const correctedInput = (props.value === ''
    ? { ...props.otherInputProps }
    : { ...props.otherInputProps, props:props.value }
  );

  return (
    <Form.Item
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22}>
          <DatePicker
            id={correctedInput.name}
            {...correctedInput}
            {...props.datePickerProps}
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
}
//
// FormDatePicker.defaultProps = {
//   formItemProps: {},
//   datePickerProps: {},
//   helpToolTipProps: {},
// };

export default FormDatePicker;
