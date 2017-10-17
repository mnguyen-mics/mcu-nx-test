import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Checkbox, Col, Row, Tooltip } from 'antd';

import { Form, McsIcons } from '../../../../../../components/index.ts';
import messages from '../../messages';

const { FormInput, FormSection, FormTagSelect } = Form;

const MOCK_TYPE_LIST = [
  { id: '1', text: 'Mobile' },
  { id: '2', text: 'Desktop' },
  { id: '3', text: 'Lundi' },
  { id: '4', text: 'Mardi' },
  { id: '5', text: 'Mercredi' },
  { id: '6', text: 'Jeudi' },
  { id: '7', text: 'Vendredi' },
  { id: '8', text: 'Samedi' },
  { id: '9', text: 'Dimanche' },
  { id: '10', text: 'Et Lundi' },
  { id: '11', text: 'Et Mardi' },
];


const MOCK_OS_LIST = [
  { id: '1', text: 'iOS' },
  { id: '2', text: 'android' },
  { id: '3', text: 'rouge' },
  { id: '4', text: 'jaune' },
  { id: '5', text: 'blue' },
  { id: '6', text: 'violet' },
  { id: '7', text: 'vert' },
  { id: '8', text: 'noir' },
  { id: '9', text: 'blanc' },
  { id: '10', text: 'beige' },
  { id: '11', text: 'doré' },
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
                    name="adGroupDeviceType"
                    component={FormTagSelect}
                    props={{
                      formValues: formValues.adGroupDeviceType,
                      options: MOCK_TYPE_LIST,
                    }}
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

                <Col span={14} />

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
