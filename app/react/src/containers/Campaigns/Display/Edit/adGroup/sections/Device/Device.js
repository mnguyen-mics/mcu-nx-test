import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Checkbox, Col, Row } from 'antd';

import { Form } from '../../../../../../../components/index.ts';
import messages from '../../../messages';
import selectOptions from './selectOptions';

const { FormSection, FormTagSelect } = Form;

class Device extends Component {

  state = { displayOptions: false }

  render() {
    const { formatMessage } = this.props;

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
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row1Label),
                  },
                  selectProps: {
                    options: selectOptions.types,
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
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row2Label),
                  },
                  selectProps: {
                    options: selectOptions.os,
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
                props={{
                  formItemProps: {
                    label: formatMessage(messages.contentSectionDevicePart1Row3Label),
                  },
                  selectProps: {
                    options: selectOptions.browser,
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
  formatMessage: PropTypes.func.isRequired,
};

export default Device;
