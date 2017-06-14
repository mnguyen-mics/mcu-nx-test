/* eslint-disable no-constant-condition */
import { delay } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import { addNotification } from '../Notifications/actions';
import NavigatorService from '../../services/NavigatorService';
import log from '../../utils/Logger';

function* getVersionLoop() {
  try {
    const response = yield call(NavigatorService.getVersion);
    let currentVersion = response.version;

    while (true) {

      const newVersion = yield call(NavigatorService.getVersion);
      if (currentVersion !== newVersion.version) {
        currentVersion = response.version;
        yield put(addNotification({
          type: 'reload',
          messageKey: 'NOTIFICATION_NEW_VERSION_TITLE',
          descriptionKey: 'NOTIFICATION_NEW_VERSION_DESCRIPTION'
        }));
      }

      yield call(delay, 10 * 1000);
    }

  } catch (error) {
    log.error('Cannot get version: ', error);
  }

}

export const versionSagas = [
  fork(getVersionLoop)
];
