/* eslint-disable no-constant-condition */
import { delay } from 'redux-saga';
import { call, fork, put, getContext } from 'redux-saga/effects';
import { notifyInfo } from '../Notifications/actions';
import log from '../../utils/Logger';

function* getVersionLoop() {
  try {
    const _navigatorService = yield getContext('navigatorService');
    const response = yield call(_navigatorService.getVersion);
    let currentVersion = response.version;
    while (true) {
      const newVersion = yield call(_navigatorService.getVersion);
      if (currentVersion !== newVersion.version) {
        currentVersion = newVersion.version;
        yield put(
          notifyInfo({
            newVersion: true,
          }),
        );
      }

      yield call(delay, 10 * 1000);
    }
  } catch (error) {
    log.error('Cannot get version: ', error);
  }
}

export const versionSagas = [fork(getVersionLoop)];
