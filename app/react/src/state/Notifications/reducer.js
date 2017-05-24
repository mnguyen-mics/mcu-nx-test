import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET
} from '../action-types';

const defaultNotificationsState = {
  notifications: [
    /**
     * Notification format:
     * {
     *  type: 'error' || 'info' || 'warning' || 'success'  || 'reload',
     *  messageKey: String,
     *  descriptionKey: String,
     *  values: Object
     * }
     */
  ]
};

const notifications = (state = defaultNotificationsState, action) => {

  switch (action.type) {
    case NOTIFICATIONS_ADD:
      return {
        ...state,
        notifications: state.notifications.concat({
          type: action.payload.type,
          messageKey: action.payload.messageKey,
          descriptionKey: action.payload.descriptionKey,
          values: action.payload.values
        })
      };

    case NOTIFICATIONS_REMOVE:
      return {
        ...state,
        notifications: [
          ...state.notifications.slice(0, action.payload),
          ...state.notifications.slice(action.payload + 1)
        ]
      };

    case NOTIFICATIONS_RESET:
      return {
        ...state,
        notifications: defaultNotificationsState.notifications
      };

    default:
      return state;
  }

};

const NotificationsReducers = {
  notifications
};

export default NotificationsReducers;

