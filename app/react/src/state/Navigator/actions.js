import { createAction } from '../../utils/ReduxHelper';

import {
  NAVIGATOR_NOTIFICATIONS_ADD,
  NAVIGATOR_NOTIFICATIONS_REMOVE,
  NAVIGATOR_NOTIFICATIONS_RESET,

  NAVIGATOR_GET_VERSION
 } from '../action-types';

const addNotification = params => createAction(NAVIGATOR_NOTIFICATIONS_ADD)(params);
const removeNotification = index => createAction(NAVIGATOR_NOTIFICATIONS_REMOVE)({ index });
const resetNotifications = createAction(NAVIGATOR_NOTIFICATIONS_RESET);

const getAppVersion = {
  request: createAction(NAVIGATOR_GET_VERSION.REQUEST),
  success: response => createAction(NAVIGATOR_GET_VERSION.SUCCESS)(response),
  failure: createAction(NAVIGATOR_GET_VERSION.FAILURE)
};

export {
  addNotification,
  removeNotification,
  resetNotifications,
  getAppVersion
};
