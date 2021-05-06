import * as React from 'react';
import { Col, Row, Tooltip } from 'antd';
// New Form component in antd's version 4 is not compatible with our current implementation
import { Form } from '@ant-design/compatible';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { RowProps } from 'antd/lib/grid/row';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface FormFieldWrapperProps {
  hasMarginBottom?: boolean;
  helpToolTipProps?: TooltipPropsWithTitle;
  hoverToolTipProps?: TooltipPropsWithTitle;
  renderFieldAction?: () => React.ReactNode;
  rowProps?: RowProps;
  small?: boolean;
}

const defaultFieldGridConfig: Partial<FormItemProps> = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15, offset: 1 },
};

const defaultRowProps: Partial<RowProps> = {
  align: 'middle',
};

const FormFieldWrapper: React.FunctionComponent<FormItemProps & FormFieldWrapperProps> = props => {
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

  const renderedLabel = small ? (
    <span>
      <span className='field-label'>{label}</span>
      <div className='field-helper'>{helpToolTipProps && helpToolTipProps.title}</div>
    </span>
  ) : (
    <span className='field-label'>{label}</span>
  );

  // TODO. In case of small=true, adding 2 to 24 makes 26 columns.
  // Understand how to configure inputs to take all the needed space, and not more.
  let actionField;
  if (typeof renderFieldAction !== 'undefined') {
    actionField = (
      <Col span={2} className='renderFieldAction'>
        {renderFieldAction()}
      </Col>
    );
  } else if (!small) {
    actionField = <Col span={2} className='no-renderFieldAction' />;
  }

  return (
    <div className={hasMarginBottom ? '' : 'form-field-wrapper'}>
      <Form.Item
        label={label && renderedLabel}
        {...(!small && defaultFieldGridConfig)}
        {...formInputProps}
      >
        <Row {...defaultRowProps} {...rowProps}>
          {hoverToolTipProps && hoverToolTipProps.title && !small ? (
            <Tooltip placement='top' {...hoverToolTipProps}>
              <Col span={20}>{children}</Col>
            </Tooltip>
          ) : (
            <Col span={small ? 24 : 20}>{children}</Col>
          )}

          {helpToolTipProps && helpToolTipProps.title && !small ? (
            <Col span={2} className={`field-tooltip`}>
              <Tooltip title={helpToolTipProps?.title} placement='right'>
                <McsIcon type='info' />
              </Tooltip>
            </Col>
          ) : undefined}

          {actionField}
        </Row>
      </Form.Item>
    </div>
  );
};

FormFieldWrapper.defaultProps = {
  hasMarginBottom: false,
  small: false,
};

export default FormFieldWrapper;
