import * as React from 'react';
import { Form, Select, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { SelectProps, OptionProps } from 'antd/lib/select';

import McsIcons from '../../components/McsIcons';

interface FormSelectProps {
  formItemProps?: FormItemProps;
  selectProps?: SelectProps;
  options?: OptionProps[];
  helpToolTipProps: TooltipProps;
}

const Option = Select.Option;

const defaultTooltipPlacement: TooltipPlacement = 'right';

class FormSelect extends React.Component<FormSelectProps & WrappedFieldProps> {

  static defaultprops = {
    formItemProps: {},
    selectProps: {},
    options: [],
    helpToolTipProps: {},
  };

  componentDidMount() {
    this.setDefaultValue();
  }

  componentDidUpdate() {
    this.setDefaultValue();
  }

  setDefaultValue = () => {
    const {
      options,
      input: {
        value,
        onChange,
      },
    } = this.props;

    if (options && options.length === 1 && (!value || value === '')) {
      onChange(options[0].value);
    }
  }

  render() {

    const {
      input: { value, onChange, onFocus },
      meta,
      formItemProps,
      selectProps,
      options,
      helpToolTipProps,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps: TooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    const optionsToDisplay = options!.map(option => (
      <Option key={option.value} value={option.value}>{option.title}</Option>
    ));

    return (
      <Form.Item
        help={meta.touched && (meta.warning || meta.error)}
        validateStatus={validateStatus}
        {...formItemProps}
      >

        <Row align="middle" type="flex">
          <Col span={22}>
            <Select
              value={value}
              onChange={onChange}
              // difficulties to map some WrappedFieldInputProps with SelectProps
              onBlur={onChange as () => any}
              onFocus={onFocus as () => any}
              {...selectProps}
            >
              {optionsToDisplay}
            </Select>
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
  }
}

export default FormSelect;
