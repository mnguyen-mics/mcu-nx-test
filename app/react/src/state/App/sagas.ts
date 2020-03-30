/* eslint-disable no-constant-condition */
import 'regenerator-runtime/runtime';
import { fork, put, take, all, call, getContext } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { appStartup } from './actions';
import { LOG_IN, CONNECTED_USER } from '../action-types';

function* watchInitializationSuccess() {
  const _authService = yield getContext('authService');
  if (_authService.isAuthenticated() || _authService.canAuthenticate()) {
    yield all([
      take([CONNECTED_USER.SUCCESS, LOG_IN.FAILURE, CONNECTED_USER.FAILURE]),
    ]);
  }
}

function* watchAngularInitializationSuccess() {
  while (true) {
    yield call(delay, 200);
  }
}

function* watchInitializationComplete() {
  yield call(watchInitializationSuccess);
  yield put(appStartup.success());
}

export const appSagas = [
  fork(watchInitializationComplete),
  fork(watchAngularInitializationSuccess),
];
