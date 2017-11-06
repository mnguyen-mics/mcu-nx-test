import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { change as changeAction, Field } from 'redux-form';
import { Checkbox, Modal } from 'antd';

import { Form } from '../../../../../../../components/index.ts';
import messages from '../../../messages';
import selectOptions from './selectOptions';

const { FormSection, FormTagSelect } = Form;
const confirm = Modal.confirm;

class Device extends Component {

  constructor(props) {
    super(props);

    this.state = { displayCustom: this.hasCustomData() };
  }

  handleCheckbox = () => {
    const {
      change,
      formatMessage,
      formName,
    } = this.props;

    if (this.state.displayCustom && this.hasCustomData()) {
      confirm({
        cancelText: formatMessage(messages.cancel),
        content: formatMessage(messages.notificationWarning),
        maskClosable: true,
        okText: formatMessage(messages.ok),
        onOk: () => {
          change(formName, 'adGroupDeviceType', []);
          change(formName, 'adGroupDeviceOS', []);
          change(formName, 'adGroupDeviceBrowser', []);
          this.setState({ displayCustom: false });
        },
      });
    } else {
      this.setState({ displayCustom: !this.state.displayCustom });
    }
  }

  hasCustomData = () => {
    const { adGroupDeviceBrowser, adGroupDeviceOS, adGroupDeviceType } = this.props.formValues;

    return (
      (adGroupDeviceBrowser && adGroupDeviceBrowser.length)
      || (adGroupDeviceOS && adGroupDeviceOS.length)
      || (adGroupDeviceType && adGroupDeviceType.length)
    );
  }

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
              checked={this.state.displayCustom}
              className="field-label checkbox-wrapper"
              onClick={this.handleCheckbox}
            >{formatMessage(messages.contentSectionDevicePart1Message)}
            </Checkbox>
          </div>

          {this.state.displayCustom
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
        </div>
      </div>
    );
  }
}

Device.defaultProps = {
  formValues: null,
};

Device.propTypes = {
  change: PropTypes.func.isRequired,
  formatMessage: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,
  formValues: PropTypes.shape().isRequired,
};


const mapDispatchToProps = {
  change: changeAction,
};

export default connect(null, mapDispatchToProps)(Device);
