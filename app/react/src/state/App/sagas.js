/* eslint-disable no-constant-condition */
import { fork, put, take, all, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import AuthService from '../../services/AuthService.ts';

import { appStartup } from './actions';

import {
  LOG_IN,
  CONNECTED_USER,
  ANGULAR_LOADED_SUCCESS,
} from '../action-types';

function* watchInitializationSuccess() {
  if (AuthService.isAuthenticated() || AuthService.canAuthenticate()) {
    yield all([
      take([CONNECTED_USER.SUCCESS, LOG_IN.FAILURE, CONNECTED_USER.FAILURE]),
      take(ANGULAR_LOADED_SUCCESS),
    ]);
  }
}

function* watchAngularInitializationSuccess() {
  while (true) {
    if (window.angularLoaded === true) {
      yield put({ type: ANGULAR_LOADED_SUCCESS });
      break;
    }
    yield call(delay, 200);
  }
}

function* watchInitializationComplete() {
  // const { failure } = yield race({
  //   success: call(watchInitializationSuccess),
  //   failure: call(watchInitializationFailure),
  // });

  // if (failure) {
  //   yield put(appStartup.failure());
  // } else {
  //  yield put(appStartup.success());
  // }

  yield call(watchInitializationSuccess);
  yield put(appStartup.success());
}

export const appSagas = [
  fork(watchInitializationComplete),
  fork(watchAngularInitializationSuccess),
];
