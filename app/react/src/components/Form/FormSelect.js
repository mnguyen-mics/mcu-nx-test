import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

const Option = Select.Option;

const defaultTooltipPlacement = 'right';

class FormSelect extends React.Component {

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

    const { input,
      meta,
      formItemProps,
      selectProps,
      options,
      helpToolTipProps
 } = this.props;

    let validateStatus = '';
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
              <Tooltip {...mergedTooltipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>}
        </Row>
      </Form.Item>
    );
  }
}

FormSelect.defaultProps = {
  formItemProps: {},
  selectProps: {},
  options: [],
  helpToolTipProps: {},
};

FormSelect.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    colon: PropTypes.bool,
  }),
  selectProps: PropTypes.shape({
    mode: PropTypes.oneOf(['multiple', 'tags', 'combobox']),
    placeholder: PropTypes.string,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      disabled: PropTypes.bool,
      value: PropTypes.string,
      key: PropTypes.string,
      title: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf([
      'top',
      'left',
      'right',
      'bottom',
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom',
    ]),
  }),
};

export default FormSelect;
