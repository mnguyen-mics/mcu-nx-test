import React from 'react';
import { isEmpty } from 'lodash';
import { Col, Form, Row, Tooltip } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { RowProps } from 'antd/lib/grid/row';
import { TooltipProps } from 'antd/lib/tooltip';

import McsIcons from '../McsIcons';

export interface FormFieldWrapperProps {
  hasMarginBottom?: boolean;
  helpToolTipProps?: TooltipProps;
  rowProps?: RowProps;
}

const defaultFieldGridConfig: Partial<FormItemProps> = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

const defaultRowProps: Partial<RowProps> = {
  type: 'flex',
  align: 'middle',
};

const FormFieldWrapper: React.SFC<FormItemProps & FormFieldWrapperProps> = props => {

  const {
    children,
    hasMarginBottom,
    helpToolTipProps,
    rowProps,
    label,
    ...formInputProps,
  } = props;

  return (
    <div className={hasMarginBottom ? '' : 'form-field-wrapper'}>
      <Form.Item
        label={<span className="field-label">{label}</span>}
        {...defaultFieldGridConfig}
        {...formInputProps}
      >
        <Row {...defaultRowProps} {...rowProps}>
          {children}

          {!isEmpty(helpToolTipProps)
            && (
              <Col span={2} className={`field-tooltip`}>
                <Tooltip {...helpToolTipProps} placement="right">
                  <McsIcons type="info" />
                </Tooltip>
              </Col>
            )
          }
        </Row>
      </Form.Item>
    </div>
  );
};

FormFieldWrapper.defaultProps = {
  hasMarginBottom: false,
};

export default FormFieldWrapper;
