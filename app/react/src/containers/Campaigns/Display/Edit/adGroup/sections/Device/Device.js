import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Checkbox } from 'antd';

import { Form } from '../../../../../../../components/index.ts';
import messages from '../../../messages';
import selectOptions from './selectOptions';

const { FormSection, FormSelect } = Form;
const { TagSelect } = FormSelect;

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

        <div className="ad-group-device-section">
          <div className="device-checkbox">
            <Checkbox
              className="field-label checkbox-wrapper"
              onClick={() => this.setState({ displayOptions: !this.state.displayOptions })}
            >{formatMessage(messages.contentSectionDevicePart1Message)}
            </Checkbox>
          </div>

          {this.state.displayOptions
          && (
            <div className="custom-content">
              <Field
                name="adGroupDeviceType"
                component={TagSelect}
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
                component={TagSelect}
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
                component={TagSelect}
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
        </div>
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
