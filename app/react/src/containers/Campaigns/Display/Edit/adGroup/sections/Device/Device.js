import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { change as changeAction, Field } from 'redux-form';
import { Button, Checkbox } from 'antd';

import { Form } from '../../../../../../../components/index.ts';
import messages from '../../../messages';
import selectOptions from './selectOptions';

import * as NotificationActions from '../../../../../../../state/Notifications/actions';

const { FormSection, FormTagSelect } = Form;

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
      notifyWarning,
      removeNotification,
    } = this.props;

    if (this.state.displayCustom && this.hasCustomData()) {
      const uid = Math.random();
      const setToAutomatic = () => {
        change(formName, 'adGroupDeviceType', []);
        change(formName, 'adGroupDeviceOS', []);
        change(formName, 'adGroupDeviceBrowser', []);
        this.setState({ displayCustom: false });
        removeNotification(uid);
      };

      notifyWarning({
        description: formatMessage(messages.notificationWarning),
        duration: 4.5,
        btn: (
          <div className="notification-buttons">
            <Button type="default" size="large" onClick={() => removeNotification(uid)}>{formatMessage(messages.cancel)}</Button>
            <Button type="primary" size="large" onClick={setToAutomatic}>{formatMessage(messages.ok)}</Button>
          </div>
        ),
        uid,
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
  notifyWarning: PropTypes.func.isRequired,
  removeNotification: PropTypes.func.isRequired,
};


const mapDispatchToProps = {
  change: changeAction,
  notifyWarning: NotificationActions.notifyWarning,
  removeNotification: NotificationActions.removeNotification
};

export default connect(null, mapDispatchToProps)(Device);
