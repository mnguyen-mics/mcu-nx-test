import { fork, put, take, all, race, call } from 'redux-saga/effects';

import AuthService from '../../services/AuthService';

import { appStartup } from './actions';

import {
  LOAD_TRANSLATIONS,
  LOG_IN,
  CONNECTED_USER,
} from '../action-types';

function* watchInitializationSuccess() {
  if (AuthService.isAuthenticated()) {
    yield all([
      take(LOAD_TRANSLATIONS.SUCCESS),
      take([CONNECTED_USER.SUCCESS, LOG_IN.FAILURE, CONNECTED_USER.FAILURE]),
    ]);

  } else {
    yield take(LOAD_TRANSLATIONS.SUCCESS);
  }
}

function* watchInitializationFailure() {
  const error = yield take([LOAD_TRANSLATIONS.FAILURE]);
  return error;
}

function* watchInitializationComplete() {
  const { failure } = yield race({
    success: call(watchInitializationSuccess),
    failure: call(watchInitializationFailure),
  });

  if (failure) {
    yield put(appStartup.failure());
  } else {
    yield put(appStartup.success());
  }

}

export const appSagas = [
  fork(watchInitializationComplete),
];
