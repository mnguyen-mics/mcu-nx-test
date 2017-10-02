import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

interface FormInputsProps {
  input: {
    name: string;
  };
  meta: {
    error?: string;
    touched?: string;
    invalid?: string;
    warning?: string;
  };
  formItemProps: {
    required?: boolean;
    label?: Element | string;
    colon?: boolean;
  };
  inputProps?: {
    type?: string;
    placehodler?: string;
    size?: 'small' | 'default' | 'large'; 
    className?: string;
  };
  helpToolTipProps?: {
    title?: string;
    placement?: TooltipPlacement;    
  };
  value?: string;
  otherInputProps?: any;
}

const defaultTooltipPlacement = 'right';

const FormInput: React.SFC<FormInputsProps> = props => {

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
        <Col span={22} >
          <Input
            id={props.input[name]}
            {...props.input}
            {...props.inputProps}
          />
        </Col>
        {displayHelpToolTip &&
          <Col span={2} className="field-tooltip">
            <Tooltip {...'mergedTooltipProps'}>
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
