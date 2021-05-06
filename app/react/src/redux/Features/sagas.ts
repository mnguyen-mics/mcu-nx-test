import { fork, put, take, race, call } from 'redux-saga/effects';

import { setOrgFeature } from './actions';

import { APP_STARTUP } from '../action-types';
import log from '../../utils/Logger';

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
    const additionnalFeatures = (global as any).window.localStorage.getItem('features');
    let features = (global as any).window.MCS_CONSTANTS.FEATURES;
    try {
      features = features.concat(JSON.parse(additionnalFeatures));
    } catch (e) {
      log.error(e);
    }
    yield put(setOrgFeature(features));
  }
}

export const featuresSagas = [fork(watchInitializationComplete)];
