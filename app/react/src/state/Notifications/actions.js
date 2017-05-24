import { createAction } from '../../utils/ReduxHelper';

import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET
 } from '../action-types';

const addNotification = params => createAction(NOTIFICATIONS_ADD)(params);
const removeNotification = index => createAction(NOTIFICATIONS_REMOVE)({ index });
const resetNotifications = createAction(NOTIFICATIONS_RESET);

export {
  addNotification,
  removeNotification,
  resetNotifications
};
