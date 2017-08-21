import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { Row } from 'antd';
import { Field } from 'redux-form';

import {
  FormInput,
  FormRangePicker,
  FormSection,
  FormSelectAddon,
} from '../../../../../../components/Form';
import messages from '../../messages';
import { isPastDate } from '../../../../../../utils/DateHelper';
<<<<<<< HEAD
import { McsIcons } from '../../../../../../components/McsIcons';

const { Option } = Select;
=======
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff

function General({
  fieldValidators: { isRequired },
  intl: { formatMessage },
}) {

  const fieldGridConfig = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10, offset: 1 }
  };

<<<<<<< HEAD
  const periodSelector = getFieldDecorator('prefix', {
    initialValue: 'per day',
  })(
    <Select style={{ display: 'flex', justifyContent: 'center', width: 100 }}>
      <Option value="per day">Per Day</Option>
      <Option value="per week">Per Week</Option>
      <Option value="per month">Per Month</Option>
    </Select>
    );
=======
  const datePickerProps = {
    format: 'DD/MM/YYYY HH:mm',
    showTime: { format: 'HH:mm' },
    disabledDate: isPastDate,
    style: { width: '100%' },
  };
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff

  return (
    <div id="general">
      <FormSection
        subtitle={messages.sectionSubtitle1}
        title={messages.sectionTitle1}
      />

      <Row>
<<<<<<< HEAD
        <FormInput
          formItemProps={{
            label: formatMessage(messages.contentSection1Row1Label),
            required: true,
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1Row1Placeholder)
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1Row1Tooltip)
=======
        <Field
          name="adGroupName"
          component={FormInput}
          validate={[isRequired]}
          props={{
            formItemProps: {
              label: formatMessage(messages.contentSection1Row1Label),
              required: true,
              ...fieldGridConfig,
            },
            inputProps: {
              placeholder: formatMessage(messages.contentSection1Row1Placeholder),
            },
            helpToolTipProps: {
              title: formatMessage(messages.contentSection1Row1Tooltip),
            },
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}
        />
      </Row>

      <Row>
<<<<<<< HEAD
        <FormInput
          formItemProps={{
            label: formatMessage(messages.contentSection1Row2Label),
            required: true,
            ...fieldGridConfig
          }}
          inputProps={{
            addonAfter: periodSelector,
            placeholder: formatMessage(messages.contentSection1Row2Placeholder),
            style: { width: '100%' },
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1Row2Tooltip)
=======
        <Field
          name="adGroupBudgetSplit"
          component={FormInput}
          validate={[isRequired]}
          props={{
            formItemProps: {
              label: formatMessage(messages.contentSection1Row2Label),
              required: true,
              ...fieldGridConfig,
            },
            inputProps: {
              addonAfter: (
                <FormSelectAddon
                  input={{ name: '', onChange: () => {}, value: 'Per Day' }}
                  options={['Per Day', 'Per Week', 'Per Month']}
                />
              ),
              placeholder: formatMessage(messages.contentSection1Row2Placeholder),
              style: { width: '100%' },
            },
            helpToolTipProps: {
              title: formatMessage(messages.contentSection1Row2Tooltip),
            },
          }}
        />
      </Row>

      <Row>
        <Field
          name="adGroupBudgetTotal"
          component={FormInput}
          validate={[isRequired]}
          props={{
            formItemProps: {
              label: formatMessage(messages.contentSection1Row3Label),
              required: true,
              ...fieldGridConfig,
            },
            inputProps: {
              placeholder: formatMessage(messages.contentSection1Row3Placeholder),
            },
            helpToolTipProps: {
              title: formatMessage(messages.contentSection1Row3Tooltip),
            },
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}
        />
      </Row>

      <Row>
        <FormRangePicker
          formItemProps={{
            label: formatMessage(messages.contentSection1Row4Label),
            labelCol: { span: 3 },
            wrapperCol: { span: 10, offset: 1 },
            required: true,
<<<<<<< HEAD
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1Row3Placeholder)
=======
          }}

          startProps={{
            ...datePickerProps,
            placeholder: formatMessage(messages.contentSection1Row4Placeholder1),
          }}

          endProps={{
            ...datePickerProps,
            placeholder: formatMessage(messages.contentSection1Row4Placeholder2),
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}

          helpToolTipProps={{
<<<<<<< HEAD
            title: formatMessage(messages.contentSection1Row3Tooltip)
=======
            placement: 'right',
            title: formatMessage(messages.contentSection1Row4Tooltip),
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}
        />
      </Row>

      <Row>
<<<<<<< HEAD
        <Form.Item
          style={{ paddingBottom: '2%' }}
          label={formatMessage(messages.contentSection1Row4Label)}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 10, offset: 1 }}
          // labelCol={{
          //   xs: { span: 24 },
          //   sm: { span: 5 },
          // }}
          required
          // wrapperCol={{
          //   xs: { span: 24 },
          //   sm: { span: 19 },
          // }}
          help
        >
          <Col span={10}>
            <FormDatePicker
              formItemProps={{}}
              datePickerProps={{
                format: 'DD/MM/YYYY HH:mm',
                showTime: { format: 'HH:mm' },
                placeholder: formatMessage(messages.contentSection1Row4Placeholder1),
                disabledDate: isPastDate,
                style: { width: '100%' },
              }}
            />
          </Col>
          <Col span={2}>
            <p className="ant-form-split">-</p>
          </Col>
          <Col span={10}>
            <FormDatePicker
              formItemProps={{}}
              datePickerProps={{
                format: 'DD/MM/YYYY HH:mm',
                showTime: { format: 'HH:mm' },
                placeholder: formatMessage(messages.contentSection1Row4Placeholder2),
                disabledDate: isPastDate,
                style: { width: '100%' },
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSection1Row4Tooltip)
              }}
            />
          </Col>
          <Col span={2} className="field-tooltip">
            <Tooltip placement="right" title={formatMessage(messages.contentSection1Row4Tooltip)}>
              <McsIcons type="info" />
            </Tooltip>
          </Col>
        </Form.Item>
      </Row>

      <Row>
        <FormInput
          formItemProps={{
            label: formatMessage(messages.contentSection1Row5Label),
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1Row5Placeholder)
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1Row5Tooltip)
=======
        <Field
          name="adGroupTechnicalName"
          component={FormInput}
          props={{
            formItemProps: {
              label: formatMessage(messages.contentSection1Row5Label),
              ...fieldGridConfig,
            },
            inputProps: {
              placeholder: formatMessage(messages.contentSection1Row5Placeholder),
            },
            helpToolTipProps: {
              title: formatMessage(messages.contentSection1Row5Tooltip),
            },
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}
        />
      </Row>

      <Row>
<<<<<<< HEAD
        <FormInput
          formItemProps={{
            label: formatMessage(messages.contentSection1Row6Label),
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1Row6Placeholder)
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1Row6Tooltip)
=======
        <Field
          name="adGroupKPI"
          component={FormInput}
          props={{
            formItemProps: {
              label: formatMessage(messages.contentSection1Row6Label),
              ...fieldGridConfig,
            },
            inputProps: {
              placeholder: formatMessage(messages.contentSection1Row6Placeholder),
            },
            helpToolTipProps: {
              title: formatMessage(messages.contentSection1Row6Tooltip),
            },
>>>>>>> [FEAT/FIX] added redux form features for submit button and other stuff
          }}
        />
      </Row>
    </div>
  );
}

General.propTypes = {
  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
)(General);
