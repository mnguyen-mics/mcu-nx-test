import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Checkbox, Col, Row } from 'antd';

import { Form } from '../../../../../../components/index.ts';
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

const MOCK_BROWSER_LIST = [
  { value: '1', label: 'browser 1' },
  { value: '2', label: 'browser 2' },
  { value: '3', label: 'browser 3' },
  { value: '4', label: 'browser 4' },
  { value: '5', label: 'browser 5' },
  { value: '6', label: 'browser 6' },
  { value: '7', label: 'browser 7' },
  { value: '8', label: 'browser 8' },
  { value: '9', label: 'browser 9' },
  { value: '10', label: 'browser 10' },
  { value: '11', label: 'browser 11' },
];

class Device extends Component {

  state = { displayOptions: false }

  render() {
    const {
      fieldGridConfig,
      fieldValidators: { isRequired },
      formatMessage,
    } = this.props;

    return (
      <div id="device">
        <FormSection
          subtitle={messages.sectionSubtitleDevice}
          title={messages.sectionTitleDevice}
        />

        <Row className="ad-group-device">
          <Col offset={1}>
            <Checkbox
              className="field-label"
              onClick={() => this.setState({ displayOptions: !this.state.displayOptions })}
            >{formatMessage(messages.contentSectionDevicePart1Message)}
            </Checkbox>
          </Col>

          {this.state.displayOptions
          && (
            <div className="custom-content">
              <Field
                name="adGroupDeviceType"
                component={FormTagSelect}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row1Label),
                    required: true,
                    ...fieldGridConfig,
                  },
                  selectProps: {
                    options: MOCK_TYPE_LIST,
                    placeholder: formatMessage(messages.contentSectionDevicePart1Row1Placeholder),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.contentSectionDevicePart1Row1Tooltip),
                  },
                }}
              />

              <Field
                name="adGroupDeviceOS"
                component={FormTagSelect}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row2Label),
                    required: true,
                    ...fieldGridConfig,
                  },
                  selectProps: {
                    options: MOCK_OS_LIST,
                    placeholder: formatMessage(messages.contentSectionDevicePart1Row2Placeholder),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.contentSectionDevicePart1Row2Tooltip),
                  },
                }}
              />

              <Field
                name="adGroupDeviceBrowser"
                component={FormTagSelect}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row3Label),
                    required: true,
                    ...fieldGridConfig,
                  },
                  selectProps: {
                    options: MOCK_BROWSER_LIST,
                    placeholder: formatMessage(messages.contentSectionDevicePart1Row3Placeholder),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.contentSectionDevicePart1Row3Tooltip),
                  },
                }}
              />
            </div>
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
  fieldGridConfig: PropTypes.shape().isRequired,

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default Device;
