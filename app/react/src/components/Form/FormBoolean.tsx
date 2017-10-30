import * as React from 'react';
import { Form, Tooltip, Row, Col, Checkbox } from 'antd';
import { isEmpty } from 'lodash';

// TS Interface
import { WrappedFieldProps } from 'redux-form';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';

import McsIcons from '../../components/McsIcons';

interface FormBooleanProps {
  formItemProps?: FormItemProps;
  inputProps?: CheckboxProps;
  helpToolTipProps: TooltipProps;
}

const defaultTooltipPlacement: TooltipPlacement = 'right';

interface StateInterface  {
  checked: boolean;
}

class FormBoolean extends React.Component<FormBooleanProps & WrappedFieldProps, StateInterface> {

  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  constructor(props: FormBooleanProps & WrappedFieldProps) {
    super(props);
    this.state = {
      checked: props.input.value ? props.input.value : false,
    };
  }

  onChange = (checked: boolean) => {
    const { input } = this.props;
    input.onChange(checked);
    this.setState({
      checked: checked,
    });
  }

  render() {
    const {
      meta,
      formItemProps,
      inputProps,
      helpToolTipProps,
      input,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

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
        <Row align="middle" type="flex" style={{ marginBottom: '20px' }}>
          <Col span={22} >
            <Checkbox
              {...input}
              {...inputProps}
              defaultChecked={this.state.checked}
            />
          </Col>
          {displayHelpToolTip &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...mergedTooltipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          }
        </Row>
      </Form.Item>
    );
  }
}

export default FormBoolean;
