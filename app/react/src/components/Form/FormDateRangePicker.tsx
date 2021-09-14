import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import moment, { Moment } from 'moment';
import { FormItemProps } from 'antd/lib/form/FormItem';

import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { DEFAULT_DATE_FORMAT } from '../../utils/DateHelper';
import { PopupContainer } from '@mediarithmics-private/mcs-components-library';
import { PickerPanelDateProps } from 'antd/lib/calendar/generateCalendar';

const { DatePicker } = PopupContainer;

export interface FormDateRangePickerProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  startDatePickerProps: PickerPanelDateProps<any>;
  endDatePickerProps: PickerPanelDateProps<any>;
  allowPastDate?: boolean;
  unixTimestamp?: boolean;
  startDateFieldName?: string;
  endDateFieldName?: string;
  disabled?: boolean;
  small?: boolean;
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
    const {
      input,
      startDateFieldName,
      unixTimestamp,
      startDatePickerProps: { showTime },
    } = this.props;

    let computedStartDate: Moment | number = date;
    if (date) {
      if (!showTime) {
        computedStartDate = computedStartDate.startOf('day');
      }

      if (unixTimestamp) {
        computedStartDate = parseInt(computedStartDate.format('x'), 0);
      }
    }

    return input.onChange({
      ...input.value,
      [startDateFieldName]: date,
    });
  };

  updateEndDate = (date: Moment) => {
    const {
      input,
      endDateFieldName,
      unixTimestamp,
      endDatePickerProps: { showTime },
    } = this.props;

    let computedEndDate: Moment | number = date;
    if (date) {
      if (!showTime) {
        computedEndDate = computedEndDate.endOf('day');
      }

      if (unixTimestamp) {
        computedEndDate = parseInt(computedEndDate.format('x'), 0);
      }
    }

    return input.onChange({
      ...input.value,
      [endDateFieldName]: date,
    });
  };

  disabledStartDate = (dateValue?: Moment) => {
    const { input, endDateFieldName } = this.props;
    const endDate = input.value[endDateFieldName];
    const allowPastDate = this.props.allowPastDate;

    const startOfToday = moment().startOf('day');

    if (!allowPastDate && dateValue && dateValue.isBefore(startOfToday)) {
      return true;
    }

    if (!dateValue || !endDate) {
      return false;
    }

    return dateValue.valueOf() > endDate.valueOf();
  };

  disabledEndDate = (dateValue?: Moment) => {
    const { input, startDateFieldName } = this.props;
    const startDate = input.value[startDateFieldName];
    const allowPastDate = this.props.allowPastDate;

    const startOfToday = moment().startOf('day');

    if (!allowPastDate && dateValue && dateValue.isBefore(startOfToday)) {
      return true;
    }

    if (!dateValue || !startDate) {
      return false;
    }

    return dateValue.valueOf() <= startDate.valueOf();
  };

  render() {
    const {
      input,
      // meta,
      formItemProps,
      helpToolTipProps,
      startDatePickerProps,
      endDatePickerProps,
      startDateFieldName,
      endDateFieldName,
      unixTimestamp,
      small,
      disabled,
    } = this.props;

    // TODO properly handle required/validation case
    // let validateStatus = 'success' as
    //   | 'success'
    //   | 'warning'
    //   | 'error'
    //   | 'validating';

    // const errorOnField = meta.error && Object.keys(meta.error).find(field => {
    //   return field === startDateFieldName || field === endDateFieldName
    // });

    // if (meta.touched && meta.invalid && errorOnField) validateStatus = 'error';
    // if (meta.touched && meta.warning) validateStatus = 'warning';

    const startDateValue =
      input.value[startDateFieldName] === undefined || input.value[startDateFieldName] === null
        ? undefined
        : unixTimestamp
        ? moment(input.value[startDateFieldName])
        : input.value[startDateFieldName];

    const endDateValue =
      input.value[endDateFieldName] === undefined || input.value[endDateFieldName] === null
        ? undefined
        : unixTimestamp
        ? moment(input.value[endDateFieldName])
        : input.value[endDateFieldName];

    return (
      <FormFieldWrapper
        // help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        // validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <div className='range-picker'>
          <div className='date-picker'>
            <DatePicker
              allowClear={false}
              {...startDatePickerProps}
              {...{ value: startDateValue }}
              onChange={this.updateStartDate}
              disabledDate={this.disabledStartDate}
              disabled={disabled}
              format={DEFAULT_DATE_FORMAT}
              size={'middle'}
            />
          </div>
          <div className='range-picker-separator'>
            <p className='form-split'>-</p>
          </div>
          <div className='date-picker'>
            <DatePicker
              allowClear={false}
              {...endDatePickerProps}
              {...{ value: endDateValue }}
              onChange={this.updateEndDate}
              disabledDate={this.disabledEndDate}
              disabled={disabled}
              format={DEFAULT_DATE_FORMAT}
              size={'middle'}
            />
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormDateRangePicker;
