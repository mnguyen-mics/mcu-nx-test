import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import moment, { Moment } from 'moment';
import { DatePicker } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';

export interface FormDateRangePickerProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  startDatePickerProps: DatePickerProps;
  endDatePickerProps: DatePickerProps;
  allowPastDate?: boolean;
  unixTimestamp?: boolean;
  startDateFieldName?: string;
  endDateFieldName?: string;
}

interface DefaultProps {
  startDateFieldName: string;
  endDateFieldName: string;
}

type JoinedProps = FormDateRangePickerProps & DefaultProps & WrappedFieldProps;

class FormDateRangePicker extends React.Component<JoinedProps> {
  static defaultProps: Partial<JoinedProps> = {
    startDateFieldName: 'startDate',
    endDateFieldName: 'endDate',
  };

  updateStartDate = (date: Moment) => {
    const { input, startDateFieldName, unixTimestamp } = this.props;
    if (unixTimestamp) {
      return input.onChange({ ...input.value, [startDateFieldName]: date && parseInt(date.format('x'), 0) })
    }
    return input.onChange({ ...input.value, [startDateFieldName]: date });
  };

  updateEndDate = (date: Moment) => {
    const { input, endDateFieldName, unixTimestamp } = this.props;
    if (unixTimestamp) {
      return input.onChange({ ...input.value, [endDateFieldName]: date && parseInt(date.format('x'), 0) })
    }
    input.onChange({ ...input.value, [endDateFieldName]: date });
  };

  disabledStartDate = (dateValue: Moment) => {
    const { input, endDateFieldName } = this.props;
    const endDate = input.value[endDateFieldName];
    const allowPastDate = this.props.allowPastDate;

    if (allowPastDate !== undefined) {
      if (!allowPastDate && dateValue.valueOf() < moment().valueOf()) {
        return true;
      }
    }

    if (!dateValue || !endDate) {
      return false;
    }

    return dateValue.valueOf() > endDate.valueOf();
  };

  disabledEndDate = (dateValue: Moment) => {
    const { input, startDateFieldName } = this.props;
    const startDate = input.value[startDateFieldName];
    const allowPastDate = this.props.allowPastDate;

    if (allowPastDate !== undefined) {
      if (!allowPastDate && dateValue.valueOf() < moment().valueOf()) {
        return true;
      }
    }

    if (!dateValue || !startDate) {
      return false;
    }

    return dateValue.valueOf() <= startDate.valueOf();
  };

  render() {
    const {
      input,
      meta,
      formItemProps,
      helpToolTipProps,
      startDatePickerProps,
      endDatePickerProps,
      startDateFieldName,
      endDateFieldName,
      unixTimestamp,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const startDateValue =
      input.value[startDateFieldName] === undefined
        ? undefined
        : unixTimestamp
          ? moment(input.value[startDateFieldName])
          : input.value[startDateFieldName];

    const endDateValue =
      input.value[endDateFieldName] === undefined
        ? undefined
        : unixTimestamp
          ? moment(input.value[endDateFieldName])
          : input.value[endDateFieldName];

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <div className="range-picker">
          <div className="date-picker">
            <DatePicker
              allowClear={false}
              {...startDatePickerProps}
              value={startDateValue}
              onChange={this.updateStartDate}
              disabledDate={this.disabledStartDate}
            />
          </div>

          <div className="range-picker-separator">
            <p className="ant-form-split">-</p>
          </div>

          <div className="date-picker">
            <DatePicker
              allowClear={false}
              {...endDatePickerProps}
              value={endDateValue}
              onChange={this.updateEndDate}
              disabledDate={this.disabledEndDate}
            />
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormDateRangePicker;
