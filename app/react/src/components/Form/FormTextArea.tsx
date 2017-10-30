import React from 'react';
import { Form, Input, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TextAreaProps } from 'antd/lib/input/TextArea';

const defaultTooltipPlacement: TooltipPlacement = 'right';

export interface FormTextArea {
  formItemProps?: FormItemProps;
  inputProps?: TextAreaProps;
  helpToolTipProps: TooltipProps;
  buttonText: string;
}

const FormTextArea: React.SFC<FormTextArea & WrappedFieldProps> = props => {

  const {
    input,
    meta,
    formItemProps,
    inputProps,
    helpToolTipProps,
  } = props;

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (meta.touched && meta.invalid) validateStatus = 'error';
  if (meta.touched && meta.warning) validateStatus = 'warning';

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

      <Row align="middle" type="flex" style={{ marginBottom: '20px' }}>
        <Col span={22} >
          <Input.TextArea
            {...input}
            {...inputProps}
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

FormTextArea.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {},
};

export default FormTextArea;
