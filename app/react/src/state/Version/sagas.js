/* eslint-disable no-constant-condition */
import { delay } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import { notifyInfo } from '../Notifications/actions';
import NavigatorService from '../../services/NavigatorService';
import log from '../../utils/Logger';

function* getVersionLoop() {
  try {
    const response = yield call(NavigatorService.getVersion);
    let currentVersion = response.version;

    while (true) {

      const newVersion = yield call(NavigatorService.getVersion);
      if (currentVersion !== newVersion.version) {
        currentVersion = newVersion.version;
        yield put(notifyInfo({
          newVersion: true
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
