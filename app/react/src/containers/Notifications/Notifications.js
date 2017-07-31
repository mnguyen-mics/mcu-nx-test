/* eslint-disable no-undef */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { notification as antNotification, Button } from 'antd';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import * as notificationsActions from '../../state/Notifications/actions';
import { isValidFormattedMessageProps } from '../../utils/IntlHelper';

const messages = defineMessages({
  newVersionMessage: {
    id: 'notification.newVersion.message',
    defaultMessage: 'New Version available'
  },
  newVersionDescription: {
    id: 'notification.newVersion.description',
    defaultMessage: 'Please reload the page'
  },
  newVersionReloadBtn: {
    id: 'notification.newVersion.button.reload',
    defaultMessage: 'Reload'
  },
  errorMessage: {
    id: 'notitication.error.default_message',
    defaultMessage: 'Error'
  },
  errorDescription: {
    id: 'notification.error.default_description',
    defaultMessage: 'An error occured'
  },
  errorDescriptionWithErrorId: {
    id: 'notification.error.default_description_with_errorid',
    defaultMessage: 'Something went wrong, please contact your administrator with the following id:'
  },
  errorDescriptionCustomWithErrorId: {
    id: 'notification.error.default_custom_description_with_errorid',
    defaultMessage: 'Please contact your administrator with the following id:'
  }
});

class Notifications extends Component {

  buildAntNotifConfig(notification) {
    const {
      intl: { formatMessage },
      removeNotification
    } = this.props;

    const antNotifcationConfig = {
      ...notification,
      key: notification.uid,
      onClose: () => {
        // remove notification from redux store
        // call onClose callback is defined by caller
        removeNotification(notification.uid);
        if (typeof notification.onClose === 'function') {
          notification.onClose();
        }
      }
    };

    // Functions bellow handle 'predifined' notification
    // - simple intl object as strings for message and description
    // - error (default error notif, display error_id)
    // - new version (displayed when a new version is detected)
    // order is important as message and description props are overriden

    // handle react-intl message and description props
    if (isValidFormattedMessageProps(notification.intlMessage)) {
      antNotifcationConfig.message = formatMessage(notification.intlMessage);
    }
    if (isValidFormattedMessageProps(notification.intlDescription)) {
      antNotifcationConfig.description = formatMessage(notification.intlDescription);
    }

    // handle Error
    if (notification.error) {

      if (!antNotifcationConfig.message) {
        antNotifcationConfig.message = (
          <span>{ formatMessage(messages.errorMessage) }</span>
        );
      }

      if (notification.error.error_id) {
        if (!antNotifcationConfig.description) {
          antNotifcationConfig.description = (
            <span>{ formatMessage(messages.errorDescriptionWithErrorId) }&nbsp;<code>{notification.error.error_id}</code></span>
          );
        } else {
          // append errorId message
          antNotifcationConfig.description = (
            <div>
              { antNotifcationConfig.description }
              <p><span>{ formatMessage(messages.errorDescriptionWithErrorId) }&nbsp;<code>{notification.error.error_id}</code></span></p>
            </div>
          );
        }
      } else if (!antNotifcationConfig.description) {
        antNotifcationConfig.description = (
          <span>{formatMessage(messages.errorDescription)}</span>
        );
      }
    }

    // handle new version notification
    if (notification.newVersion) {
      antNotifcationConfig.message = (
        <span>{ formatMessage(messages.newVersionMessage) }</span>
      );
      antNotifcationConfig.description = (
        <span>{ formatMessage(messages.newVersionDescription) }</span>
      );
      antNotifcationConfig.btn = (
        <Button type="primary" size="small" onClick={() => window.location.reload()} >
          <span>{ formatMessage(messages.newVersionReloadBtn) }</span>
        </Button>
      );
    }

    return antNotifcationConfig;
  }

  componentWillReceiveProps(nextProps) {
    const { notifications: currentNotifications } = this.props;
    const { notifications: nextNotifications } = nextProps;

    if (nextNotifications.length > 0) {

      const nextNotificationIds = nextNotifications.map(notif => notif.uid);
      const currentNotificationIds = currentNotifications.map(notif => notif.uid);

      const notifIdsToClose = currentNotificationIds.filter(id => {
        return nextNotificationIds.indexOf(id) < 0;
      });

      notifIdsToClose.forEach(id => antNotification.close(id));

      const newNotifications = nextNotifications.filter(notif => {
        return currentNotificationIds.indexOf(notif.uid) < 0;
      });

      newNotifications.forEach(notif => {
        switch (notif.level) {
          case 'info':
            antNotification.info(this.buildAntNotifConfig(notif));
            break;
          case 'success':
            antNotification.success(this.buildAntNotifConfig(notif));
            break;
          case 'warning':
            antNotification.warning(this.buildAntNotifConfig(notif));
            break;
          case 'error':
            antNotification.error(this.buildAntNotifConfig(notif));
            break;
          default: break;
        }
      });

    } else {
      antNotification.destroy();
    }

  }

  render() {
    return null;
  }

}

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    level: PropTypes.string,
    uid: PropTypes.number,
    notifConfig: PropTypes.object,
    error: PropTypes.object,
  })).isRequired,
  removeNotification: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default compose(
  connect(
    state => ({ notifications: state.notifications }),
    { removeNotification: notificationsActions.removeNotification }
  ),
  injectIntl,
)(Notifications);
