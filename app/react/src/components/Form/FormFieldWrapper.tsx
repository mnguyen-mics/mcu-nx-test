import React from 'react';
import { isEmpty } from 'lodash';
import { Col, Form, Row, Tooltip } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';

import McsIcons from '../McsIcons';

interface FormFieldWrapperProps {
  helpToolTipProps?: TooltipProps;
}

const FormFieldWrapper: React.SFC<FormItemProps & FormFieldWrapperProps> = props => {

  const {
    children,
    helpToolTipProps,
    label,
    ...formInputProps,
  } = props;

  const {
    style,
    ...tooltipProps,
  } = helpToolTipProps!;

  const fieldGridConfig = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10, offset: 1 },
  };

  return (
    <Form.Item
      label={<span className="field-label">{label}</span>}
      {...fieldGridConfig}
      {...formInputProps}
    >
      <Row align="middle" type="flex">
        {children}

        {!isEmpty(helpToolTipProps)
          && (
            <Col span={2} className="field-tooltip" style={style}>
              <Tooltip {...tooltipProps} placement="right">
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          )
        }
      </Row>
    </Form.Item>
  );
};

FormFieldWrapper.defaultProps = {
  helpToolTipProps: {},
};

export default FormFieldWrapper;
