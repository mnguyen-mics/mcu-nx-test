import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Tooltip, Row, Col } from 'antd';
import { isEmpty } from 'lodash';
import { Field, getFormMeta, getFormSyncErrors } from 'redux-form';

import McsIcons from '../../../components/McsIcons';
import DateInput from './DateInput';
import { isPastDate } from '../../../utils/DateHelper';

function FormRangePicker({
  endProps,
  fieldValidators,
  fields,
  formItemProps,
  helpToolTipProps,
  startProps,
  syncErrors,
  values,
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

  const displayError = (date) => (
    fields
    && fields[date]
    && fields[date].touched
    // && fields[date].visited
  );

  const error = (
    (displayError(startProps.name) && syncErrors[startProps.name])
    || (displayError(endProps.name) && syncErrors[endProps.name])
    || ''
  );

  /*
   * AntDesign's DatePicker doesn't currently permits onBlur events.
   * Also it isn't compatible with redux-form.
   * Therefore we can't display date picker errors right now.
   * See at https://github.com/ant-design/ant-design/issues/7263
  */
  return (
    <Form.Item
      {...formItemProps}
      help={error}
      validateStatus={error ? 'error' : ''}
    >
      <Row align="middle" type="flex">
        <Col span={10}>
          <div>
            <Field
              name={startProps.name}
              component={DateInput}
              validate={fieldValidators.start}
              props={{
                ...startProps,
                disabledDate: disabledDate(true),
              }}
            />
          </div>
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
  endProps: {},
  fieldValidators: { start: [], end: [] },
  fields: null,
  formItemProps: {},
  helpToolTipProps: {},
  startProps: {},
  syncErrors: {},
};

FormRangePicker.propTypes = {
  endProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  fieldValidators: PropTypes.shape({
    start: PropTypes.arrayOf(PropTypes.func.isRequired),
    end: PropTypes.arrayOf(PropTypes.func.isRequired),
  }),

  fields: PropTypes.shape(),

  formItemProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    labelCol: PropTypes.shape().isRequired,
    required: PropTypes.bool,
    wrapperCol: PropTypes.shape().isRequired,
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

  startProps: PropTypes.shape({
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    placeholder: PropTypes.string,
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  }),

  syncErrors: PropTypes.shape(),

  values: PropTypes.shape({
    startDate: PropTypes.Moment,
    endDate: PropTypes.Moment,
  }).isRequired,
};

export default connect(
  (state, ownProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    fields: getFormMeta(ownProps.formId)(state),
    syncErrors: getFormSyncErrors(ownProps.formId)(state),
  }),
)(FormRangePicker);
