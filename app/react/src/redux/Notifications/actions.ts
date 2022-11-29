import { createAction } from 'redux-actions';
import log from '../../utils/Logger';

import { NOTIFICATIONS_ADD, NOTIFICATIONS_REMOVE, NOTIFICATIONS_RESET } from '../action-types';
import { Notification } from '../../containers/Notifications/Notifications';

const addNotification = (opts: any, level: string = 'success') => {
  return createAction(NOTIFICATIONS_ADD)({
    ...opts,
    uid: opts.uid || Date.now(),
    level,
  });
};

const removeNotification = (key: string) => {
  return createAction(NOTIFICATIONS_REMOVE)(key);
};

const resetNotifications = createAction(NOTIFICATIONS_RESET);

const notifyError = (error: any, notifConfig: Notification | {} = {}) => {
  log.error(error);
  return addNotification(
    {
      duration: 0,
      ...notifConfig,
      error,
    },
    'error',
  );
};

const notifySuccess = (notifConfig: Notification | {} = {}) => {
  return addNotification(
    {
      // default success duration is 4.5 secondes
      duration: 4.5,
      ...notifConfig,
    },
    'success',
  );
};

const notifyWarning = (notifConfig: Notification | {} = {}) => {
  return addNotification(
    {
      duration: 0,
      ...notifConfig,
    },
    'warning',
  );
};

const notifyInfo = (notifConfig: Notification | {} = {}) => {
  return addNotification(
    {
      duration: 0,
      ...notifConfig,
    },
    'info',
  );
};

export {
  addNotification,
  removeNotification,
  resetNotifications,
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
};
