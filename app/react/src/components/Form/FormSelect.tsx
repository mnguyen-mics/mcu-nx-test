import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

interface FormSelectProps {
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
  // selectProps: any;
  selectProps?: object;
  mode: 'multiple' | 'tags' | 'combobox';
  placeholder?: string;
  options?: [{
    disabled?: boolean;
    value?: string;
    key?: string;
    text?: string;
    title?: string;
  }];
  helpToolTipProps?: object;
  title?: string;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft'| 'topRight' | 'bottomLeft'| 'bottomRight' | 'leftTop' | 'leftBottom'| 'rightTop' | 'rightBottom';

}

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

const FormSelect: React.SFC<FormSelectProps> = props => {

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
        <Col span={22}>
          <Select {...props.input} {...props.selectProps}>
            {props.options.map(({ disabled, value, key, title, text }) => (
              <Option {...{ disabled, value, key, title }}>{text}</Option>
            ))}
          </Select>
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

export default FormSelect;
