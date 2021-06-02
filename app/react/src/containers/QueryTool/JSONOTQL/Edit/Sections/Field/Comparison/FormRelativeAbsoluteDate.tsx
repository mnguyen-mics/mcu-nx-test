import * as React from 'react';
import { DatePicker, Radio, Input, InputNumber, Col, Select } from 'antd';
import moment from 'moment';
import { WrappedFieldProps } from 'redux-form';
import { FormItemProps } from 'antd/lib/form/FormItem';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../../../../../../../components/Form/FormFieldWrapper';
import { RadioChangeEvent } from 'antd/lib/radio';
import { defineMessages, FormattedMessage } from 'react-intl';
import { TimeComparisonOperator } from '../../../../../../../models/datamart/graphdb/QueryDocument';
import { DatePickerProps } from 'antd/lib/date-picker';

const messages = defineMessages({
  absolute: {
    id: 'queryTool.datepicker.label.absolute',
    defaultMessage: 'Absolute',
  },
  relative: {
    id: 'queryTool.datepicker.label.relative',
    defaultMessage: 'Relative',
  },
  days: {
    id: 'queryTool.datepicker.label.days',
    defaultMessage: 'Days',
  },
  month: {
    id: 'queryTool.datepicker.label.month',
    defaultMessage: 'Month',
  },
  year: {
    id: 'queryTool.datepicker.label.year',
    defaultMessage: 'Year',
  },
  ago: {
    id: 'queryTool.datepicker.label.ago',
    defaultMessage: 'Ago',
  },
});

export interface FormRelativeAbsoluteDateProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  datePickerProps?: DatePickerProps;
  unixTimstamp?: boolean;
  small?: boolean;
  disabled?: boolean;
  dateComparisonOperator?: any; // here it should be only a TimeComparisonOperator
  // The new Audience Builder doesn't handle list values for Date input
  noListValue?: boolean;
  handleStringValue?: (value: any) => void;
}

type Props = FormRelativeAbsoluteDateProps & WrappedFieldProps;

type DateType = 'ABSOLUTE' | 'RELATIVE';
type DateRelativePeriodType = 'd' | 'M' | 'y';

export interface FormRelativeAbsoluteDateState {
  datePickerType: DateType;
  relativePeriod: DateRelativePeriodType;
}

export default class FormRelativeAbsoluteDate extends React.Component<
  Props,
  FormRelativeAbsoluteDateState
> {
  constructor(props: Props) {
    super(props);
    const { input, noListValue } = props;
    const datePickerType = this.getValueType(input.value);
    let relativePeriod: DateRelativePeriodType = 'd';
    if ((input.value || input.value.length !== 0) && datePickerType === 'RELATIVE') {
      if (noListValue) {
        relativePeriod = this.getRelativePeriodValue(input.value);
      } else {
        relativePeriod = this.getRelativePeriodValue(input.value[0]);
      }
    }
    this.state = {
      datePickerType: datePickerType,
      relativePeriod: relativePeriod,
    };
  }

  componentDidMount() {
    const { input, noListValue, handleStringValue } = this.props;
    if (!input.value || input.value.length === 0) {
      if (this.state.datePickerType === 'RELATIVE') {
        input.onChange(noListValue ? 'now-1d' : ['now-1d']);
      } else {
        let value;
        if (!this.props.unixTimstamp) {
          value = this.getAdjustedAbsoluteTimestamp().toISOString();
          input.onChange(noListValue ? value : [value]);
        } else {
          value = this.getAdjustedAbsoluteTimestamp().valueOf();
          input.onChange(noListValue ? value : [value]);
        }
        if (handleStringValue) {
          handleStringValue(value.toString());
        }
      }
    }
  }

  getValueType = (value: Array<string | number>): DateType => {
    const { noListValue } = this.props;
    if (noListValue && value) {
      return value.toString().includes('now') ? 'RELATIVE' : 'ABSOLUTE';
    } else if (value && value.length && value[0]) {
      if (typeof value[0] === 'string') {
        return value[0].indexOf('now') > -1 ? 'RELATIVE' : 'ABSOLUTE';
      }
    }
    return 'ABSOLUTE';
  };

  getNumericRelativeValue = (value: string): number => {
    if (value && typeof value === 'string') {
      if (value === 'now') {
        return 0;
      } else if (value.indexOf('now-') > -1) {
        const parsedValue = parseInt(
          value
            .replace(/now\-/g, '')
            .replace(/\//g, '')
            .replace(/M/g, '')
            .replace(/d/g, '')
            .replace(/y/g, ''),
          0,
        );
        return isNaN(parsedValue) ? 0 : parsedValue;
      }
      return 0;
    }
    return 0;
  };

  onValueChange = (e: number | undefined) => {
    if (!isNaN(e as number)) {
      return this.generateRelativeValue(e);
    }
  };

  generateRelativeValue = (value: number | undefined) => {
    const { noListValue } = this.props;
    return this.props.input.onChange(
      noListValue
        ? `now-${value}${this.state.relativePeriod}/${this.state.relativePeriod}`
        : [`now-${value}${this.state.relativePeriod}/${this.state.relativePeriod}`],
    );
  };

  getRelativePeriodValue = (value: string): DateRelativePeriodType => {
    return value[value.length - 1] as DateRelativePeriodType;
  };

  getAdjustedAbsoluteTimestamp = (date?: moment.Moment) => {
    const { dateComparisonOperator } = this.props;

    const dateToAdjust = date || moment();

    if (!dateComparisonOperator) return dateToAdjust.startOf('day');
    switch (dateComparisonOperator as TimeComparisonOperator) {
      case 'BEFORE':
      case 'AFTER_OR_EQUAL':
        return dateToAdjust.startOf('day');
      case 'BEFORE_OR_EQUAL':
      case 'AFTER':
        return dateToAdjust.endOf('day');
      default:
        return dateToAdjust.startOf('day');
    }
  };

  componentDidUpdate(prevProps: Props) {
    const { dateComparisonOperator, noListValue, handleStringValue } = this.props;

    const { dateComparisonOperator: prevDateComparisonOperator } = prevProps;

    if (
      dateComparisonOperator !== prevDateComparisonOperator &&
      this.state.datePickerType === 'ABSOLUTE'
    ) {
      const date = this.props.input.value.length
        ? this.getAdjustedAbsoluteTimestamp(moment(this.props.input.value[0]))
        : this.getAdjustedAbsoluteTimestamp();
      const newValue = this.props.unixTimstamp
        ? this.getAdjustedAbsoluteTimestamp(date).valueOf()
        : this.getAdjustedAbsoluteTimestamp(date);
      this.props.input.onChange(noListValue ? newValue : [newValue]);
      if (handleStringValue) {
        handleStringValue(newValue.toString());
      }
    }
  }

  render() {
    const { disabled, noListValue, handleStringValue } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (this.props.meta.touched && this.props.meta.invalid) validateStatus = 'error';
    if (this.props.meta.touched && this.props.meta.warning) validateStatus = 'warning';

    // By default, input.value is initialised to '' by redux-form
    // But antd DatePicker doesn't like that
    // So we don't pass this this.props if equal to ''

    let value;

    if (this.state.datePickerType === 'ABSOLUTE') {
      value = !!this.props.input.value
        ? this.getAdjustedAbsoluteTimestamp(
            moment(noListValue ? parseInt(this.props.input.value, 10) : this.props.input.value[0]),
          )
        : this.getAdjustedAbsoluteTimestamp();
    } else {
      value = this.getNumericRelativeValue(
        noListValue ? this.props.input.value : this.props.input.value[0],
      );
    }

    const onDatePickerChange = (date: moment.Moment, dateString: string) => {
      const newValue = this.props.unixTimstamp
        ? this.getAdjustedAbsoluteTimestamp(date).valueOf()
        : this.getAdjustedAbsoluteTimestamp(date);

      this.props.input.onChange(noListValue ? newValue : [newValue]);
      if (handleStringValue) {
        handleStringValue(newValue.toString());
      }
    };

    const onRadioChange = (e: RadioChangeEvent) => {
      this.setState({ datePickerType: e.target.value });
      const newValue =
        e.target.value === 'ABSOLUTE'
          ? this.props.unixTimstamp
            ? this.getAdjustedAbsoluteTimestamp().valueOf()
            : this.getAdjustedAbsoluteTimestamp().toISOString()
          : 'now';
      this.props.input.onChange(noListValue ? newValue : [newValue]);
      if (handleStringValue) {
        handleStringValue(newValue.toString());
      }
    };
    const onPeriodChange = (val: DateRelativePeriodType) => {
      this.setState({ relativePeriod: val }, () =>
        this.generateRelativeValue(
          this.getNumericRelativeValue(
            noListValue ? this.props.input.value : this.props.input.value[0],
          ),
        ),
      );
    };
    return (
      <FormFieldWrapper
        help={this.props.meta.touched && (this.props.meta.warning || this.props.meta.error)}
        helpToolTipProps={this.props.helpToolTipProps}
        validateStatus={validateStatus}
        small={this.props.small}
        {...this.props.formItemProps}
      >
        <div className='mcs-relativeAbsoluteDateForm_picker'>
          <RadioGroup
            style={{ width: '100%' }}
            defaultValue={this.state.datePickerType}
            onChange={onRadioChange}
            disabled={disabled}
          >
            <RadioButton style={{ width: '50%' }} value='ABSOLUTE'>
              <FormattedMessage {...messages.absolute} />
            </RadioButton>
            <RadioButton style={{ width: '50%' }} value='RELATIVE'>
              <FormattedMessage {...messages.relative} />
            </RadioButton>
          </RadioGroup>
        </div>
        <div>
          {this.state.datePickerType === 'ABSOLUTE' ? (
            <DatePicker
              allowClear={false}
              value={moment(value)}
              onChange={onDatePickerChange}
              style={{ width: '100%' }}
              defaultValue={this.getAdjustedAbsoluteTimestamp()}
              {...this.props.datePickerProps}
              disabled={disabled}
            />
          ) : (
            <div>
              <InputGroup compact={true}>
                <Col span={15}>
                  <InputNumber
                    style={{ width: '100%' }}
                    defaultValue={1}
                    value={value as number}
                    onChange={this.onValueChange}
                    disabled={disabled}
                  />
                </Col>
                <Col span={7}>
                  <Select
                    defaultValue={this.state.relativePeriod}
                    onChange={onPeriodChange}
                    getPopupContainer={
                      this.props.datePickerProps && this.props.datePickerProps.getPopupContainer
                    }
                    disabled={disabled}
                  >
                    <Select.Option value='d'>
                      <FormattedMessage {...messages.days} />
                    </Select.Option>
                    <Select.Option value='M'>
                      <FormattedMessage {...messages.month} />
                    </Select.Option>
                    <Select.Option value='y'>
                      <FormattedMessage {...messages.year} />
                    </Select.Option>
                  </Select>
                </Col>
                <Col span={2} style={{ height: 40, lineHeight: '40px' }}>
                  <FormattedMessage {...messages.ago} />
                </Col>
              </InputGroup>
            </div>
          )}
        </div>
      </FormFieldWrapper>
    );
  }
}
