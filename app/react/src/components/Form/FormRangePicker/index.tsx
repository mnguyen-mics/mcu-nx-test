import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';
import {
  Field,
  getFormMeta,
  getFormSyncErrors,
  Validator,
  GenericField,
  FormErrors,
} from 'redux-form';

import McsIcons from '../../../components/McsIcons';
import DateInput from './DateInput';
import { isPastDate } from '../../../utils/DateHelper';

import { TooltipProps } from 'antd/lib/tooltip';
import moment from 'moment';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { DatePickerProps } from 'antd/lib/date-picker';

interface FormRangePickerProps {
  endProps: GenericField<DatePickerProps>;
  fieldValidators?: {
    start: Validator | Validator[],
    end: Validator | Validator[],
  };
  fieldsMetaData: {[field: string]: { touched: boolean, visited: boolean }};
  formItemProps: FormItemProps;
  helpToolTipProps: TooltipProps;
  startProps: GenericField<DatePickerProps>;
  syncErrors: FormErrors<{[key: string]: string}>;
  values: {
    startDate?: moment.Moment;
    endDate?: moment.Moment;
  };
}

const DateInputField = Field as new () => GenericField<DatePickerProps>;

class FormRangePicker extends React.Component<FormRangePickerProps, {}> {

  static defaultProps: Partial<FormRangePickerProps> = {
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

    const { startProps, endProps, syncErrors, fieldValidators, helpToolTipProps } = this.props;

    const error = (
      (this.displayError(startProps.name) && syncErrors[startProps.name])
      || (this.displayError(endProps.name) && syncErrors[endProps.name])
      || ''
    );

    return (
      <Form.Item
        {...this.props.formItemProps}
        help={error}
        validateStatus={error ? 'error' : 'success'}
      >
        <Row align="middle" type="flex">
          <Col span={10}>
            <div>
              <DateInputField
                component={DateInput}
                validate={fieldValidators!.start}
                disabledDate={this.disabledDate(false)}
                {...startProps}
              />
            </div>
          </Col>

          <Col span={2}>
            <p className="ant-form-split">-</p>
          </Col>

          <Col span={10}>
            <DateInputField
              component={DateInput}
              validate={fieldValidators!.end}
              disabledDate={this.disabledDate(false)}
              {...endProps}
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
  (state, ownProps: { formId: string }) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    fieldsMetaData: getFormMeta(ownProps.formId)(state),
    syncErrors: getFormSyncErrors(ownProps.formId)(state),
  }),
)(FormRangePicker);
