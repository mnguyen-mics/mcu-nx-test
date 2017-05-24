import { takeEvery } from 'redux-saga';
import { call, fork, put, select } from 'redux-saga/effects';

import log from '../../utils/Logger';

import {
  getAppVersion
} from './actions';

import {
  addNotification
} from '../Notifications/actions';

import {
  getCurrentVersion
} from './selectors';

import NavigatorService from '../../services/NavigatorService';

import {
  NAVIGATOR_GET_VERSION,
} from '../action-types';

function* getVersion() {
  try {

    const currentVersion = yield select(getCurrentVersion);
    const response = yield call(NavigatorService.getVersion);

    yield put(getAppVersion.success(response));

    if (currentVersion && currentVersion !== response.version) {
      yield put(addNotification({
        type: 'reload',
        messageKey: 'NOTIFICATION_NEW_VERSION_TITLE',
        descriptionKey: 'NOTIFICATION_NEW_VERSION_DESCRIPTION'
      }));
    }

  } catch (error) {
    log.error(error);
    yield put(getAppVersion.failure(error));
  }
}

function* watchGetVersion() {
  yield* takeEvery(NAVIGATOR_GET_VERSION.REQUEST, getVersion);
}

export const navigatorSagas = [
  fork(watchGetVersion)
];
