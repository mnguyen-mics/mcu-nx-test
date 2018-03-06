/* eslint-disable no-constant-condition */
import { fork, put, take, all, race, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import AuthService from '../../services/AuthService';

import { appStartup } from './actions';

import {
  LOAD_TRANSLATIONS,
  LOG_IN,
  CONNECTED_USER,
  FETCH_COOKIES,
  ANGULAR_LOADED_SUCCESS,
} from '../action-types';


function* watchInitializationSuccess() {
  if (AuthService.isAuthenticated()) {
    yield all([
      take(LOAD_TRANSLATIONS.SUCCESS),
      take([FETCH_COOKIES.SUCCESS, FETCH_COOKIES.FAILURE]),
      take([CONNECTED_USER.SUCCESS, LOG_IN.FAILURE, CONNECTED_USER.FAILURE]),
      take(ANGULAR_LOADED_SUCCESS),
    ]);

  } else {
    yield take(LOAD_TRANSLATIONS.SUCCESS);
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

function* watchInitializationFailure() {
  const error = yield take(LOAD_TRANSLATIONS.FAILURE);
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
  fork(watchAngularInitializationSuccess)
];
