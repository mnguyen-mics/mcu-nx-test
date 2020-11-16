import * as React from 'react';
import { isEmpty } from 'lodash';
import { Col, Form, Row, Tooltip } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { RowProps } from 'antd/lib/grid/row';
import { TooltipProps } from 'antd/lib/tooltip';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface FormFieldWrapperProps {
  hasMarginBottom?: boolean;
  helpToolTipProps?: TooltipProps;
  hoverToolTipProps?: TooltipProps;
  renderFieldAction?: () => React.ReactNode;
  rowProps?: RowProps;
  small?: boolean;
}

const defaultFieldGridConfig: Partial<FormItemProps> = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15, offset: 1 },
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
    hoverToolTipProps,
    rowProps,
    label,
    renderFieldAction,
    small,
    ...formInputProps
  } = props;


  const renderedLabel = small ? <span><span className="field-label">{label}</span><div className="field-helper">{helpToolTipProps && helpToolTipProps.title}</div></span>  : <span className="field-label">{label}</span>

  return (
    <div className={hasMarginBottom ? '' : 'form-field-wrapper'}>
      <Form.Item
        label={label && renderedLabel}
        {...!small && defaultFieldGridConfig}
        {...formInputProps}
      >
        <Row {...defaultRowProps} {...rowProps}>
          {!isEmpty(hoverToolTipProps) && !small
            ? (
              <Tooltip placement="top" {...hoverToolTipProps}>
                <Col span={20}>{children}</Col>
              </Tooltip>
            ) : (
              <Col span={small ? 24 : 20}>{children}</Col>
            )
          }

          {!isEmpty(helpToolTipProps) && !small
            ? (
              <Col span={2} className={`field-tooltip`}>
                <Tooltip {...helpToolTipProps} placement="right">
                  <McsIcon type="info" />
                </Tooltip>
              </Col>
            ) : (
              small ? null : <Col span={2} className="
              " />
            )
          }
          {(typeof renderFieldAction !== 'undefined')
            ? (
              <Col span={2} className="renderFieldAction">
                {renderFieldAction()}
              </Col>
            ) : (
              <Col span={2} className="no-renderFieldAction" />
            )
          }
        </Row>
      </Form.Item>
    </div>
  );
};

FormFieldWrapper.defaultProps = {
  hasMarginBottom: false,
  small: false
};

export default FormFieldWrapper;
