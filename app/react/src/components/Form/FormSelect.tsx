import * as React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

interface FormSelectProps {
  // input: {
  //   name: string;
  //   value?: string;
  //   onChange?: Function;
  // };
  input: any;
  meta: {
    error?: string;
    touched?: string;
    invalid?: string;
    warning?: string;
  };
  formItemProps?: {
    required?: boolean;
    label?: Element | string;
    colon?: boolean;
  };
  selectProps?: {
    mode?: 'multiple' | 'tags' | 'comobox';
    placehodler?: string;  
  };
  options?: [{
    disabled?: boolean;
    value?: string;
    key?: string;
    title?: string;
    text?: string;
  }];
  helpToolTipProps: {
    title?: string;
    placement?: TooltipPlacement;
  };
  value?: string;
  otherInputProps?: any;
  help?: React.ReactNode;
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
}

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

// const FormSelect: React.SFC<FormSelectProps> = props => {
class FormSelect extends React.Component<FormSelectProps> {

  static defaultprops = {
    formItemProps: {},
    selectProps: {},
    options: [],
    helpToolTipProps: {}
  }

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
        onChange
      }
    } = this.props;


    if (options && options.length === 1 && (!value || value === '')) {
      onChange(options[0].value);
    }
  }

  render() {

    const { 
      input,
      meta,
      formItemProps,
      selectProps,
      options,
      helpToolTipProps
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    return (
      <Form.Item
        help={meta.touched && (meta.warning || meta.error)}
        validateStatus={validateStatus}
        {...formItemProps}
      >

        <Row align="middle" type="flex">
          <Col span={22}>
          <Select {...input} {...selectProps}>
              {options.map(({ disabled, value, key, title, text }) => (
                <Option {...{ disabled, value, key, title }}>{text}</Option>
              ))}
            </Select>
          </Col>

          {displayHelpToolTip &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...'mergedTooltipProps'}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormSelect;
