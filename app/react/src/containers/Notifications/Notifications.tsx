import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { notification as antNotification, Button } from 'antd';
import {
  injectIntl,
  defineMessages,
  InjectedIntlProps,
  FormattedMessage,
} from 'react-intl';
import * as notificationsActions from '../../redux/Notifications/actions';
import { isValidFormattedMessageProps } from '../../utils/IntlHelper';
import { ArgsProps } from 'antd/lib/notification';
import { MicsReduxState } from '../../utils/ReduxHelper';

const messages = defineMessages({
  newVersionMessage: {
    id: 'notification.newVersion.message',
    defaultMessage: 'New Version available',
  },
  newVersionDescription: {
    id: 'notification.newVersion.description',
    defaultMessage: 'Please reload the page',
  },
  newVersionReloadBtn: {
    id: 'notification.newVersion.button.reload',
    defaultMessage: 'Reload',
  },
  errorMessage: {
    id: 'notitication.error.default_message',
    defaultMessage: 'Error',
  },
  errorDescription: {
    id: 'notification.error.default_description',
    defaultMessage: 'An error occured',
  },
  errorDescriptionWithErrorId: {
    id: 'notification.error.default_description_with_errorid',
    defaultMessage:
      'Something went wrong, please contact your administrator with the following id:',
  },
  errorDescriptionCustomWithErrorId: {
    id: 'notification.error.default_custom_description_with_errorid',
    defaultMessage: 'Please contact your administrator with the following id:',
  },
  errorDescriptionReason: {
    id: 'notification.error.possible_reason',
    defaultMessage: 'Possible Reason:',
  },
});

export interface Notification {
  level: string;
  uid: string;
  error: {
    error: string;
    error_id: string;
    message?: string;
  };
  newVersion: boolean;
  onClose: () => void;
  intlMessage: FormattedMessage.MessageDescriptor;
  intlDescription: FormattedMessage.MessageDescriptor;
}

interface NotificationsProps {
  notifications: Notification[];
}

interface MapStateToProps {
  removeNotification: (uid: string) => void;
}

type Props = NotificationsProps & MapStateToProps & InjectedIntlProps;

class Notifications extends React.Component<Props> {
  componentDidUpdate(previousProps: Props) {
    const { notifications } = this.props;
    const { notifications: previousNotifications } = previousProps;

    if (notifications.length > 0) {
      const notificationIds = notifications.map(notif => notif.uid);
      const previousNotificationIds = previousNotifications.map(
        notif => notif.uid,
      );

      const notifIdsToClose = previousNotificationIds.filter(id => {
        return notificationIds.indexOf(id) < 0;
      });

      notifIdsToClose.forEach(id => antNotification.close(id));

      const newNotifications = notifications.filter(notif => {
        return previousNotificationIds.indexOf(notif.uid) < 0;
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
          default:
            break;
        }
      });
    } else {
      antNotification.destroy();
    }
  }

  buildAntNotifConfig(notification: Notification): ArgsProps {
    const {
      intl: { formatMessage },
      removeNotification,
    } = this.props;

    const notifcationConfig: any = {
      ...notification,
      onClose: () => {
        // remove notification from redux store
        // call onClose callback is defined by caller
        removeNotification(notification.uid);
        if (typeof notification.onClose === 'function') {
          notification.onClose();
        }
      },
    };

    // Functions bellow handle 'predefined' notification
    // - simple intl object as strings for message and description
    // - error (default error notif, display error_id)
    // - new version (displayed when a new version is detected)
    // order is important as message and description props are overriden

    // handle react-intl message and description props
    if (isValidFormattedMessageProps(notification.intlMessage)) {
      notifcationConfig.message = formatMessage(notification.intlMessage);
    }
    if (isValidFormattedMessageProps(notification.intlDescription)) {
      notifcationConfig.description = formatMessage(
        notification.intlDescription,
      );
    }

    // handle Error
    if (notification.error) {
      if (!notifcationConfig.message) {
        notifcationConfig.message = (
          <span>{formatMessage(messages.errorMessage)}</span>
        );
      }

      if (notification.error.error_id) {
        if (!notifcationConfig.description) {
          notifcationConfig.description = notification.error.error ? (
            <span>
              {formatMessage(messages.errorDescriptionWithErrorId)}&nbsp;
              <code>{notification.error.error_id}</code>&nbsp;
              {formatMessage(messages.errorDescriptionReason)}&nbsp;
              <code>{notification.error.error}</code>
            </span>
          ) : (
            <div>
              <p>
                <span>
                  {formatMessage(messages.errorDescriptionWithErrorId)}&nbsp;
                  <code>{notification.error.error_id}</code>
                </span>
              </p>
            </div>
          );
        } else {
          // append errorId message
          notifcationConfig.description = notification.error.error ? (
            <div>
              {notifcationConfig.description}
              <p>
                <span>
                  {formatMessage(messages.errorDescriptionWithErrorId)}&nbsp;
                  <code>{notification.error.error_id}</code>&nbsp;
                  {formatMessage(messages.errorDescriptionReason)}&nbsp;
                  <code>{notification.error.error}</code>
                </span>
              </p>
            </div>
          ) : (
            <div>
              {notifcationConfig.description}
              <p>
                <span>
                  {formatMessage(messages.errorDescriptionWithErrorId)}&nbsp;
                  <code>{notification.error.error_id}</code>
                </span>
              </p>
            </div>
          );
        }
      // OVH crisis
      } else if (notification.error.message) {
        notifcationConfig.description = (
          <span>{notification.error.message}</span>
        );
      } else if (!notifcationConfig.description) {
        notifcationConfig.description = (
          <span>{formatMessage(messages.errorDescription)}</span>
        );
      }
    }

    // handle new version notification
    if (notification.newVersion) {
      notifcationConfig.message = (
        <span>{formatMessage(messages.newVersionMessage)}</span>
      );
      notifcationConfig.description = (
        <span>{formatMessage(messages.newVersionDescription)}</span>
      );

      const onClick = () => window.location.reload();
      notifcationConfig.btn = (
        <Button type="primary" size="small" onClick={onClick}>
          <span>{formatMessage(messages.newVersionReloadBtn)}</span>
        </Button>
      );
    }

    return notifcationConfig;
  }

  render() {
    return null;
  }
}

export default compose(
  connect(
    (state: MicsReduxState) => ({ notifications: state.notifications }),
    { removeNotification: notificationsActions.removeNotification },
  ),
  injectIntl,
)(Notifications);
