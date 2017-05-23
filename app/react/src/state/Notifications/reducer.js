import lodash from 'lodash';

import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET
} from '../action-types';

/**
 * Notification format:
 * {
 *  type: 'error' || 'info' || 'warning' || 'success'  || 'reload',
 *  messageKey: String,
 *  descriptionKey: String,
 *  values: Object
 * }
 */
const emptyNotificationsArray = [];

const notifications = (state = emptyNotificationsArray, action) => {

  switch (action.type) {
    case NOTIFICATIONS_ADD:
      return [
        ...state,
        lodash.pick(action.payload, [
          'type',
          'messageKey',
          'descriptionKey',
          'values'
        ])
      ];

    case NOTIFICATIONS_REMOVE:
      return [
        ...state.slice(0, action.payload),
        ...state.slice(action.payload + 1)
      ];

    case NOTIFICATIONS_RESET:
      return emptyNotificationsArray;

    default:
      return state;
  }

};

const NotificationsReducers = {
  notifications
};

export default NotificationsReducers;

