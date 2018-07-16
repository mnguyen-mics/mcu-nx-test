import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET,
} from '../action-types';

const notifications = (state = [], action) => {
  switch (action.type) {
    case NOTIFICATIONS_ADD:
      return [
        ...state,
        action.payload,
      ];
    case NOTIFICATIONS_REMOVE:
      return state.filter(notification => {
        return notification.uid !== action.payload;
      });
    case NOTIFICATIONS_RESET:
      return [];
    default:
      return state;
  }
};

export default { notifications };
