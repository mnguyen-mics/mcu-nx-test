import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { Col, Form, Row, Select, Tooltip } from 'antd';

import { FormDatePicker, FormInput, FormSection } from '../../../../../../components/Form';
import messages from '../../messages';
import { isPastDate } from '../../../../../../utils/DateHelper';
import { McsIcons } from '../../../../../../components/McsIcons';

const { Option } = Select;

function General({
  getFieldDecorator,
  intl: { formatMessage },
}) {

  const fieldGridConfig = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10, offset: 1 }
  };

  const periodSelector = getFieldDecorator('prefix', {
    initialValue: 'per day',
  })(
    <Select style={{ display: 'flex', justifyContent: 'center', width: 100 }}>
      <Option value="per day">Per Day</Option>
      <Option value="per week">Per Week</Option>
      <Option value="per month">Per Month</Option>
    </Select>
    );

  return (
    <div id="general">
      <FormSection
        subtitle={messages.sectionSubtitle1}
        title={messages.sectionTitle1}
      />

      <Row>
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
          }}
        />
      </Row>

      <Row>
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
          }}
        />
      </Row>

      <Row>
        <FormInput
          formItemProps={{
            label: formatMessage(messages.contentSection1Row3Label),
            required: true,
            ...fieldGridConfig
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSection1Row3Placeholder)
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSection1Row3Tooltip)
          }}
        />
      </Row>

      <Row>
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
          }}
        />
      </Row>

      <Row>
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
          }}
        />
      </Row>
    </div>
  );
}

General.propTypes = {
  getFieldDecorator: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
)(General);
