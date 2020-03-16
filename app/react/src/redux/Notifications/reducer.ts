import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET,
} from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';
import { Notification } from '../../containers/Notifications/Notifications';

const notifications = (state = [], action: Action<Payload>) => {
  switch (action.type) {
    case NOTIFICATIONS_ADD:
      return [...state, action.payload];
    case NOTIFICATIONS_REMOVE:
      return state.filter((notification: Notification) => {
        return notification.uid !== action.payload.id;
      });
    case NOTIFICATIONS_RESET:
      return [];
    default:
      return state;
  }
};

export default { notifications };
