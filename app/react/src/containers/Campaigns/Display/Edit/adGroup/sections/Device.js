import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Checkbox, Col, Row, Tooltip } from 'antd';

import { Form, McsIcons } from '../../../../../../components/index.ts';
import messages from '../../messages';

const { FormInput, FormSection, FormTagSelect } = Form;

const MOCK_TYPE_LIST = [
  { value: '1', label: 'Mobile' },
  { value: '2', label: 'Desktop' },
  { value: '3', label: 'Lundi' },
  { value: '4', label: 'Mardi' },
  { value: '5', label: 'Mercredi' },
  { value: '6', label: 'Jeudi' },
  { value: '7', label: 'Vendredi' },
  { value: '8', label: 'Samedi' },
  { value: '9', label: 'Dimanche' },
  { value: '10', label: 'Et Lundi' },
  { value: '11', label: 'Et Mardi' },
];


const MOCK_OS_LIST = [
  { value: '1', label: 'iOS' },
  { value: '2', label: 'android' },
  { value: '3', label: 'rouge' },
  { value: '4', label: 'jaune' },
  { value: '5', label: 'blue' },
  { value: '6', label: 'violet' },
  { value: '7', label: 'vert' },
  { value: '8', label: 'noir' },
  { value: '9', label: 'blanc' },
  { value: '10', label: 'beige' },
  { value: '11', label: 'doré' },
];

class Device extends Component {

  state = { displayOptions: true }

  render() {
    const {
      fieldValidators: { isRequired },
      formatMessage,
      formValues,
    } = this.props;

    console.log('formValues = ', formValues);

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (
      <div id="device">
        <FormSection
          subtitle={messages.sectionSubtitleDevice}
          title={messages.sectionTitleDevice}
        />

        <Row className="ad-group-device">
          <Col offset={2}>
            <Checkbox
              className="bold font-size checkbox"
              onClick={() => this.setState({ displayOptions: !this.state.displayOptions })}
            >{formatMessage(messages.contentSectionDevicePart1Message)}
            </Checkbox>
          </Col>

          {this.state.displayOptions
          && (
            <Col className="custom-content font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSectionDevicePart1Row1Label)}
                </Col>

                <Col span={14}>
                  <Field
                    component={FormTagSelect}
                    name="adGroupDeviceType"
                    options={MOCK_TYPE_LIST}
                  />
                </Col>

                <Col span={1} className="field-tooltip">
                  <Tooltip title={formatMessage(messages.contentSectionDevicePart1Row1Tooltip)}>
                    <McsIcons type="info" />
                  </Tooltip>
                </Col>
              </Row>

              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSectionDevicePart1Row2Label)}
                </Col>

                <Col span={14}>
                  <Field
                    component={FormTagSelect}
                    name="adGroupDeviceOS"
                    options={MOCK_OS_LIST}
                  />
                </Col>

                <Col span={1} className="field-tooltip">
                  <Tooltip title={formatMessage(messages.contentSectionDevicePart1Row2Tooltip)}>
                    <McsIcons type="info" />
                  </Tooltip>
                </Col>
              </Row>

              <Row>
                <Field
                  name="adGroupDeviceBrowser"
                  component={FormInput}
                  validate={[isRequired]}
                  props={{
                    formItemProps: {
                      label: formatMessage(messages.contentSectionDevicePart1Row3Label),
                      required: true,
                      ...fieldGridConfig,
                    },
                    inputProps: {
                      placeholder: formatMessage(messages.contentSectionGeneralRow1Placeholder),
                    },
                    helpToolTipProps: {
                      title: formatMessage(messages.contentSectionDevicePart1Row3Tooltip),
                    },
                  }}
                />
              </Row>
            </Col>
          )
        }
        </Row>
      </div>
    );
  }
}

Device.defaultProps = {
  formValues: null,
};

Device.propTypes = {
  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape(),
};

export default Device;
