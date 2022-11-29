import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { WrappedFieldProps } from 'redux-form';
import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../../../../../../components/Form/FormFieldWrapper';
import { FormItemProps } from 'antd/lib/form/FormItem';
import Select, { SelectProps } from 'antd/lib/select';
import { Col, InputNumber, Row } from 'antd';
import messages from '../messages';

export interface OptionsAndSeparatorProps {
  label: string;
  value: string;
  separator: string;
}

export interface CleaningRuleLifeTimeDurationProps extends FormFieldWrapperProps {
  formItemProps: FormItemProps;
  selectProps?: SelectProps<string>;
  optionsAndSeparators: OptionsAndSeparatorProps[];
}

type Props = CleaningRuleLifeTimeDurationProps & WrappedFieldProps & WrappedComponentProps;

class CleaningRuleLifeTimeDuration extends React.Component<Props> {
  updateSelect = (selectedValue: string) => {
    const { input } = this.props;
    input.onChange({ ...input.value, selectedValue: selectedValue });
  };

  updatePeriodNumber = (value: number) => {
    const { input } = this.props;

    input.onChange({ ...input.value, periodNumber: value });
  };

  createOptions = () => {
    const { optionsAndSeparators } = this.props;

    return optionsAndSeparators.map(optionAndSeparator => (
      <Select.Option
        key={optionAndSeparator.value}
        value={optionAndSeparator.value}
        className={`mcs-cleaningRuleLifeTime_select_action_${optionAndSeparator.label}`}
      >
        {optionAndSeparator.label}
      </Select.Option>
    ));
  };

  createSeparator = () => {
    const { optionsAndSeparators, input } = this.props;

    const optionAndSeparatorOpt = optionsAndSeparators.find(optionAndSeparator => {
      return optionAndSeparator.value === input.value.selectedValue;
    });

    const defaultSeparator = optionsAndSeparators[0].separator;

    return optionAndSeparatorOpt ? optionAndSeparatorOpt.separator : defaultSeparator;
  };

  render() {
    const { input, helpToolTipProps, small, formItemProps, selectProps, meta, intl } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const options = this.createOptions();

    const separator = this.createSeparator();

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
              className='mcs-cleaningRuleLifeTime_select'
            >
              {options}
            </Select>
          </Col>
          <Col span={3} className={'text-center mcs-cleaningRules_seperator'}>
            {separator}
          </Col>
          <Col span={5}>
            <InputNumber
              value={input.value.periodNumber}
              onChange={this.updatePeriodNumber}
              className='mcs-cleaningRuleLifeTime_input'
            />
          </Col>
          <Col span={3}>{intl.formatMessage(messages.cleaningRuleLifeDurationDays)}</Col>
        </Row>
      </FormFieldWrapper>
    );
  }
}

export default injectIntl(CleaningRuleLifeTimeDuration);
