import { fork, put, take, race, call } from 'redux-saga/effects';

import { setOrgFeature } from './actions';

import {
  APP_STARTUP,
} from '../action-types';

function* watchInitializationSuccess() {
  yield take(APP_STARTUP.SUCCESS);
}

function* watchInitializationFailure() {
  const error = yield take([APP_STARTUP.FAILURE]);
  return error;
}

function* watchInitializationComplete() {
  const { failure } = yield race({
    success: call(watchInitializationSuccess),
    failure: call(watchInitializationFailure),
  });

  if (!failure) {
    yield put(setOrgFeature(global.window.MCS_CONSTANTS.FEATURES));
  }

}

export const featuresSagas = [
  fork(watchInitializationComplete),
];
