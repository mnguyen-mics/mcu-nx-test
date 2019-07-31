import { createAction } from 'redux-actions';
import log from '../../utils/Logger';

import {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_REMOVE,
  NOTIFICATIONS_RESET,
} from '../action-types';

const addNotification = (opts: any, level = 'success') => {
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

const notifyError = (error: any, notifConfig:any = {}) => {
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

const notifySuccess = (notifConfig: any) => {
  return addNotification(
    {
      // default success duration is 4.5 secondes
      duration: 4.5,
      ...notifConfig,
    },
    'success',
  );
};

const notifyWarning = (notifConfig: any) => {
  return addNotification(
    {
      duration: 0,
      ...notifConfig,
    },
    'warning',
  );
};

const notifyInfo = (notifConfig: any) => {
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
