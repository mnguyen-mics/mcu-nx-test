import { createAction } from 'redux-actions';
import log from '../../utils/Logger';

import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET,
 } from '../action-types';

const addNotification = (opts, level = 'success') => {
  return createAction(NOTIFICATIONS_ADD)({
    ...opts,
    uid: opts.uid || Date.now(),
    level,
  });
};

const removeNotification = key => {
  return createAction(NOTIFICATIONS_REMOVE)(key);
};

const resetNotifications = createAction(NOTIFICATIONS_RESET);

const notifyError = (error, notifConfig = {}) => {
  log.error(error);
  return addNotification({
    duration: 0,
    ...notifConfig,
    error,
  }, 'error');
};

const notifySuccess = notifConfig => {
  return addNotification({
    // default success duration is 4.5 secondes
    duration: 4.5,
    ...notifConfig,
  }, 'success');
};

const notifyWarning = notifConfig => {
  return addNotification({
    duration: 0,
    ...notifConfig,
  }, 'warning');
};

const notifyInfo = notifConfig => {
  return addNotification({
    duration: 0,
    ...notifConfig,
  }, 'info');
};

export {
  removeNotification,
  resetNotifications,
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
};
