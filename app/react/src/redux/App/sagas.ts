/* eslint-disable no-constant-condition */
import 'regenerator-runtime/runtime';
import { fork, put, take, all, call, getContext } from 'redux-saga/effects';
import { appStartup } from './actions';
import { LOG_IN, CONNECTED_USER } from '../action-types';

function* watchInitializationSuccess() {
  const _authService = yield getContext('authService');
  if (_authService.isAuthenticated() || _authService.canAuthenticate()) {
    yield all([take([CONNECTED_USER.SUCCESS, LOG_IN.FAILURE, CONNECTED_USER.FAILURE])]);
  }
}

function* watchInitializationComplete() {
  yield call(watchInitializationSuccess);
  yield put(appStartup.success());
}

export const appSagas = [fork(watchInitializationComplete)];
