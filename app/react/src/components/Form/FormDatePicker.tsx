import * as React from 'react';
import { Form, DatePicker, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

// TS Interfaces
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { WrappedFieldInputProps, WrappedFieldMetaProps } from 'redux-form';
import { InputProps } from 'antd/lib/input/Input';
import { DatePickerProps } from 'antd/lib/date-picker';
import { FormItemProps } from 'antd/lib/form/FormItem';

import McsIcons from '../../components/McsIcons';

interface FormDatePickerProps {
  input: WrappedFieldInputProps;
  meta: WrappedFieldMetaProps;
  formItemProps: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  datePickerProps: DatePickerProps;
}

const defaultTooltipPlacement: TooltipPlacement = 'right';

const FormDatePicker: React.SFC<FormDatePickerProps> = props => {

  let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
  if (props.meta.touched && props.meta.invalid) validateStatus = 'error';
  if (props.meta.touched && props.meta.warning) validateStatus = 'warning';

  const displayHelpToolTip = !isEmpty(props.helpToolTipProps);

  const mergedTooltipProps: TooltipProps = {
    placement: defaultTooltipPlacement,
    ...props.helpToolTipProps,
  };

  // By default, input.value is initialised to '' by redux-form
  // But antd DatePicker doesn't like that
  // So we don't pass this props if equal to ''
  if (props.input.value === '') {
    delete props.input.value;
  }

  return (
    <Form.Item
      help={props.meta.touched && (props.meta.warning || props.meta.error)}
      validateStatus={validateStatus}
      {...props.formItemProps}
    >

      <Row align="middle" type="flex">
        <Col span={22}>
          <DatePicker
            allowClear={false}
            {...props.input}
            {...props.datePickerProps}
          />
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
};

FormDatePicker.defaultProps = {
  formItemProps: {},
  datePickerProps: {},
  helpToolTipProps: {},
};

export default FormDatePicker;
