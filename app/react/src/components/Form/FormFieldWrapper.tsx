import React from 'react';
import { isEmpty } from 'lodash';
import { Col, Form, Row, Tooltip } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { RowProps } from 'antd/lib/grid/row';
import { TooltipProps } from 'antd/lib/tooltip';

import McsIcon from '../McsIcon';

export interface FormFieldWrapperProps {
  hasMarginBottom?: boolean;
  helpToolTipProps?: TooltipProps;
  renderFieldAction?: () => React.ReactNode;
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
    renderFieldAction,
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
          <Col span={20}>{children}</Col>

          {!isEmpty(helpToolTipProps)
            ? (
              <Col span={2} className={`field-tooltip`}>
                <Tooltip {...helpToolTipProps} placement="right">
                  <McsIcon type="info" />
                </Tooltip>
              </Col>
            ) : (
              <Col span={2} className="no-field-tooltip"/>
            )
          }
          {(typeof renderFieldAction !== 'undefined')
            ? (
              <Col span={2} className="renderFieldAction">
                {renderFieldAction()}
              </Col>
            ) : (
              <Col span={2} className="no-renderFieldAction"/>
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
