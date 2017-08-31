import React from 'react';
import PropTypes from 'prop-types';
import { Form, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';
import { Field } from 'redux-form';

import McsIcons from '../../../components/McsIcons';
import DateInput from './DateInput';
import { isPastDate } from '../../../utils/DateHelper';

function FormRangePicker({
  formItemProps,
  startProps,
  endProps,
  values,
  fieldValidators,
  helpToolTipProps,
}) {

  const disabledDate = (isStart) => (currentDate) => {
    const { startDate, endDate } = values;
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
  };

  return (
    <Form.Item {...formItemProps}>
      <Row align="middle" type="flex">
        <Col span={10}>
          <Field
            name={startProps.name}
            component={DateInput}
            validate={fieldValidators.start}
            props={{
              ...startProps,
              disabledDate: disabledDate(true),
            }}
          />
        </Col>

        <Col span={2}>
          <p className="ant-form-split">-</p>
        </Col>

        <Col span={10}>
          <Field
            name={endProps.name}
            component={DateInput}
            validate={fieldValidators.end}
            props={{
              ...endProps,
              disabledDate: disabledDate(false),
            }}
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

FormRangePicker.defaultProps = {
  fieldValidators: { start: [], end: [] },
  formItemProps: {},
  startProps: {},
  endProps: {},
  helpToolTipProps: {},
};

FormRangePicker.propTypes = {
  fieldValidators: PropTypes.shape({
    start: PropTypes.arrayOf(PropTypes.func.isRequired),
    end: PropTypes.arrayOf(PropTypes.func.isRequired),
  }),

  formItemProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    labelCol: PropTypes.shape().isRequired,
    required: PropTypes.bool,
    wrapperCol: PropTypes.shape().isRequired,
  }).isRequired,

  startProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  endProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  values: PropTypes.shape({
    startDate: PropTypes.Moment,
    endDate: PropTypes.Moment,
  }).isRequired,

  helpToolTipProps: PropTypes.shape({
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

    title: PropTypes.string,
  }),
};

export default FormRangePicker;
