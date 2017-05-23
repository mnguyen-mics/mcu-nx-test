import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification as antNotification, Icon } from 'antd';

import * as notificationsActions from '../../state/Notifications/actions';

class Notifications extends Component {

  componentDidMount() {
    // start
  }

  componentWillReceiveProps(nextProps) {
    const {
      notifications,
      translations,
      removeNotification
    } = this.props;

    const {
      notifications: nextNotifications
    } = nextProps;

    if (notifications.length !== nextNotifications.length && nextNotifications.length) {

      const onReloadButton = () => window.location.reload(); // eslint-disable-line no-undef

      const reloadButton = <Icon type="reload" onClick={onReloadButton} />;

      const buildDefaultNotification = (notification, index) => ({
        message: translations[notification.messageKey],
        description: translations[notification.descriptionKey],
        key: index,
        duration: null,
        onClose: () => removeNotification(index)
      });

      nextNotifications
        .filter((nextNotification, index) => index >= notifications.length)
        .forEach((notification, index) => {
          switch (notification.type) {
            case 'success':
              return antNotification.success({
                ...buildDefaultNotification(notification, index),
                duration: 4.5
              });
            case 'error':
              return antNotification.error({
                ...buildDefaultNotification(notification, index)
              });
            case 'info':
              return antNotification.info({
                ...buildDefaultNotification(notification, index)
              });
            case 'warning':
              return antNotification.warning({
                ...buildDefaultNotification(notification, index)
              });
            case 'reload':
              return antNotification.warning({
                ...buildDefaultNotification(notification, index),
                btn: reloadButton,
              });
            default:
              return antNotification.open({
                ...buildDefaultNotification(notification, index)
              });
          }
        });
    }
  }

  render() {
    return null;
  }

}

Notifications.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    messageKey: PropTypes.string,
    descriptionKey: PropTypes.string,
    values: PropTypes.object
  })).isRequired,
  removeNotification: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  translations: state.translations,
  notifications: state.notifications
});

const mapDispatchToProps = {
  removeNotification: notificationsActions.removeNotification
};

Notifications = connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications);

export default Notifications;
