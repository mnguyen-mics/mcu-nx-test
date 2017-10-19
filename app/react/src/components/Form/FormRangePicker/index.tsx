import * as React from 'react';
import { connect } from 'react-redux';
import {
  Field,
  getFormMeta,
  getFormSyncErrors,
  Validator,
  GenericField,
  FormErrors,
} from 'redux-form';
import moment from 'moment';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { DatePickerProps } from 'antd/lib/date-picker';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../../components/Form/FormFieldWrapper';
import DateInput from './DateInput';
import { isPastDate } from '../../../utils/DateHelper';

interface FormRangePickerProps {
  endProps: GenericField<DatePickerProps>;
  fieldValidators?: {
    start: Validator | Validator[],
    end: Validator | Validator[],
  };
  fieldsMetaData: {[field: string]: { touched: boolean, visited: boolean }};
  formItemProps: FormItemProps;
  startProps: GenericField<DatePickerProps>;
  syncErrors: FormErrors<{[key: string]: string}>;
  values: {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
  };
}

const DateInputField = Field as new () => GenericField<DatePickerProps>;

class FormRangePicker extends React.Component<FormRangePickerProps & FormFieldWrapperProps, {}> {

  static defaultProps: Partial<FormRangePickerProps> = {
    fieldsMetaData: undefined,
    fieldValidators: { start: [], end: [] },
    syncErrors: undefined,
  };

  disabledDate = (isStart: boolean) => (currentDate: moment.Moment) => {
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
  }

  displayError = (date: string) => (
    this.props.fieldsMetaData
    && this.props.fieldsMetaData[date]
    && this.props.fieldsMetaData[date].touched
  )

  render() {
    const {
      values: {
        startDate,
        endDate,
      },
      endProps,
      formItemProps,
      fieldValidators,
      helpToolTipProps,
      startProps,
      syncErrors,
    } = this.props;

    const error = (
      (!startDate && this.displayError(startProps.name) && syncErrors && syncErrors[startProps.name])
      || (!endDate && this.displayError(endProps.name) && syncErrors && syncErrors[endProps.name])
      || ''
    );

    return (
      <FormFieldWrapper
        help={error}
        helpToolTipProps={helpToolTipProps}
        validateStatus={error ? 'error' : 'success'}
        {...formItemProps}
      >
        <div style={{ width: '43%' }}>
          <div>
            <DateInputField
              component={DateInput}
              validate={fieldValidators!.start}
              disabledDate={this.disabledDate(true)}
              {...startProps}
            />
          </div>
        </div>

        <div style={{ width: '5.5%' }}>
          <p className="ant-form-split">-</p>
        </div>

        <div style={{ width: '43%' }}>
          <DateInputField
            component={DateInput}
            validate={fieldValidators!.end}
            disabledDate={this.disabledDate(false)}
            {...endProps}
          />
        </div>
      </FormFieldWrapper>
    );
  }
}

export default connect(
  (state, ownProps: { formId: string }) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    fieldsMetaData: getFormMeta(ownProps.formId)(state),
    syncErrors: getFormSyncErrors(ownProps.formId)(state),
  }),
)(FormRangePicker);
