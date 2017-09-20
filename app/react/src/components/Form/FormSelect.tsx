import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

interface FormSelectProps {
  input: {
    name: string;
  };
  meta: {
    error?: string;
    touched?: string;
    invalid?: string;
    warning?: string;
  };
  formItemProps?: {
    required?: boolean;
    label?: Element | string;
    colon?: boolean;
  };
  selectProps?: {
    mode?: 'multiple' | 'tags' | 'comobox';
    placehodler?: string;  
  };
  options?: [{
    disabled?: boolean;
    value?: string;
    key?: string;
    title?: string;
    text?: string;
  }];
  helpToolTipProps: {
    title?: string;
    placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft'| 'topRight' | 'bottomLeft'| 'bottomRight' | 'leftTop' | 'leftBottom'| 'rightTop' | 'rightBottom';
  };
  value?: string;
  otherInputProps?: any;
  help?: React.ReactNode;
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
}

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

const FormSelect: React.SFC<FormSelectProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
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
        <Col span={22}>
          <Select {...this.props.input} {...props.selectProps}>
            {props.options.map(({ disabled, value, key, title, text }) => (
              <Option {...{ disabled, value, key, title }}>{text}</Option>
            ))}
          </Select>
        </Col>

        {displayHelpToolTip &&
          <Col span={2} className="field-tooltip">
            <Tooltip {...'mergedTooltipProps'}>
              <McsIcons type="info" />
            </Tooltip>
          </Col>}
      </Row>
    </Form.Item>
  );
}

export default FormSelect;
