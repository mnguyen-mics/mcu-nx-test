import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { FormItemProps } from 'antd/lib/form/FormItem';
import Select, { SelectProps } from 'antd/lib/select';
import { Col, InputNumber, Row } from 'antd';

export interface OptionsAndSeparatorProps {
  label: string;
  value: string;
  separator: string;
}

export interface FormLinkedSelectAndPeriodPickerProps
  extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  selectProps?: SelectProps;
  optionsAndSeparators: OptionsAndSeparatorProps[];
}

type JoinedProps = FormLinkedSelectAndPeriodPickerProps & WrappedFieldProps;

class FormLinkedSelectAndPeriodPicker extends React.Component<JoinedProps> {
  updateSelect = (selectedValue: string) => {
    const { input } = this.props;
    input.onChange({ ...input.value, selectedValue: selectedValue });
  };

  updatePeriodNumber = (value: number) => {
    const { input } = this.props;

    input.onChange({ ...input.value, periodNumber: value });
  };

  updatePeriodUnit = (selectedPeriodUnit: string) => {
    const { input } = this.props;
    input.onChange({ ...input.value, periodUnit: selectedPeriodUnit });
  };

  createOptions = () => {
    const { optionsAndSeparators } = this.props;

    return optionsAndSeparators.map(optionAndSeparator => (
      <Select.Option key={optionAndSeparator.value}>
        {optionAndSeparator.label}
      </Select.Option>
    ));
  };

  createSeparator = () => {
    const { optionsAndSeparators, input } = this.props;

    const optionAndSeparatorOpt = optionsAndSeparators.find(
      optionAndSeparator => {
        return optionAndSeparator.value === input.value.selectedValue;
      },
    );

    const defaultSeparator = optionsAndSeparators[0].separator;

    return optionAndSeparatorOpt
      ? optionAndSeparatorOpt.separator
      : defaultSeparator;
  };

  render() {
    const {
      input,
      helpToolTipProps,
      small,
      formItemProps,
      selectProps,
      meta,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';

    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const options = this.createOptions();

    const separator = this.createSeparator();

    const periodUnits = [
      { label: 'Days', value: 'D' },
      { label: 'Months', value: 'M' },
      { label: 'Years', value: 'Y' },
    ];

    // The select is removed temporarily.

    // const periodUnitOptions = periodUnits.map(period => (
    //   <Select.Option key={period.value}>{period.label}</Select.Option>
    // ));

    const periodUnitOpt = periodUnits.find(periodUnit => input.value.periodUnit === periodUnit.value);

    const periodUnitLabel = periodUnitOpt ? periodUnitOpt.label : periodUnits[0].label;

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        validateStatus={validateStatus}
        helpToolTipProps={helpToolTipProps}
        small={small}
        {...formItemProps}
      >
        <Row>
          <Col span={6}>
            <Select
              value={input.value.selectedValue}
              onChange={this.updateSelect}
              {...selectProps}
              disabled={true}
            >
              {options}
            </Select>
          </Col>
          <Col span={1} />
          <Col span={1}>{separator}</Col>
          <Col span={1} />
          <Col span={3}>
            <InputNumber
              value={input.value.periodNumber}
              onChange={this.updatePeriodNumber}
              disabled={true}
            />
          </Col>
          <Col span={6}>
            {periodUnitLabel}
            {/* The Select is removed temporarily. */}
            {/* <Select
              value={input.value.periodUnit}
              onChange={this.updatePeriodUnit}
              disabled={true}
            >
              {periodUnitOptions}
            </Select> */}
          </Col>
        </Row>
      </FormFieldWrapper>
    );
  }
}

export default FormLinkedSelectAndPeriodPicker;
