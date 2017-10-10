import * as React from 'react';
import { isEmpty } from 'lodash';

// TS Interfaces
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';

import McsIcons from '../../components/McsIcons';

interface FormInputsProps {
  formItemProps: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
}

const defaultTooltipPlacement: TooltipPlacement = 'right';

const FormInput: React.SFC<FormInputsProps & WrappedFieldProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(props.helpToolTipProps);

  const mergedTooltipProps: TooltipProps = {
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
            id={props.input.name}
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
};

FormInput.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {},
};

export default FormInput;
