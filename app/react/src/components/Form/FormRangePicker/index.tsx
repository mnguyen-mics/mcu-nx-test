import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';
import { Field, getFormMeta, getFormSyncErrors } from 'redux-form';

import McsIcons from '../../../components/McsIcons';
import DateInput from './DateInput';
import { isPastDate } from '../../../utils/DateHelper';

import { TooltipProps } from 'antd/lib/tooltip';
import moment from 'moment';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { DatePickerProps } from 'antd/lib/date-picker';
import { BaseFieldProps, ErrorSelector, Validator, GenericField } from 'redux-form';

import { DateInputProps } from './DateInput';
import FormInput from '../FormInput';

const DateInputField = Field as new () => GenericField<DatePickerProps>;

interface FormRangePickerProps {
  endProps: GenericField<DatePickerProps>;
  fieldValidators?: {
    start: Validator,
    end: Validator
  };
  fields: object;
  formItemProps: FormItemProps;
  helpToolTipProps :TooltipProps;
  startProps: GenericField<DatePickerProps>;
  syncErrors?: ErrorSelector;
  values: {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
  }
}

class FormRangePicker extends React.Component<FormRangePickerProps, {}> {
  
  static defaultProps = {
    endProps: {},
    fieldValidators: { start: [], end: [] },
    fields: null,
    formItemProps: {},
    helpToolTipProps: {},
    startProps: {},
    syncErrors: {},
  }

  disabledDate = (isStart) => (currentDate) => {
    const { startDate, endDate } = this.props.values;
    const dateToCompare = (isStart ? endDate : startDate);

    if (isPastDate(currentDate)) {
      return true;
    }

    if (!currentDate || !dateToCompare) {
      return false;
    }

    return (isStart
      ? currentDate.valueOf() > dateToCompare.valueOf()
      : currentDate.valueOf() <= dateToCompare.valueOf()
    );
  };

  displayError = (date) => (
    this.props.fields
    && this.props.fields[date]
    && this.props.fields[date].touched
  );

  render() {

    const { startProps, endProps, syncErrors, fieldValidators, helpToolTipProps } = this.props;
    
    const error = (
      (this.displayError(startProps.name) && syncErrors[startProps.name])
      || (this.displayError(endProps.name) && syncErrors[endProps.name])
      || ''
    );
    
    const fieldProps = {
      props: {
        ...startProps,
        disabledDate: this.disabledDate(true),
      }}
    return (
      <Form.Item
        { ...this.props.formItemProps }
        help={error}
        validateStatus={error ? 'error' : 'success'}
      >
        <Row align="middle" type="flex">
          <Col span={10}>
            <div>
              <DateInputField
                component={DateInput}
                validate={fieldValidators.start}
                disabledDate={this.disabledDate(false)}
                { ...startProps }
              />
            </div>
          </Col>
  
          <Col span={2}>
            <p className="ant-form-split">-</p>
          </Col>
  
          <Col span={10}>
            <DateInputField
              component={DateInput}
              validate={fieldValidators.end}
              disabledDate={this.disabledDate(false)}
              { ...endProps }
            />
          </Col>
  
          {!isEmpty(helpToolTipProps)
            ? (
              <Col span={2} className="field-tooltip">
                <Tooltip {...helpToolTipProps}>
                  <McsIcons type="info" />
                </Tooltip>
              </Col>
            )
            : null
          }
        </Row>
      </Form.Item>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    fields: getFormMeta(ownProps.formId)(state),
    syncErrors: getFormSyncErrors(ownProps.formId)(state),
  }),
)(FormRangePicker);
