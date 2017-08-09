import { takeEvery } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../utils/Logger';

import AuthService from '../../services/AuthService';

import {
  sendPassword,
} from './actions';

import {
  PASSWORD_FORGOT,
} from '../action-types';

function* sendPasswordLoop({ payload }) {

  try {
    const {
      email,
    } = payload;

    if (!email) throw new Error('Payload is invalid :\'(');

    const response = yield call(AuthService.sendPassword, email);
    yield put(sendPassword.success(response));

  } catch (error) {
    log.error(error);
    yield put(sendPassword.failure(error));
  }
}

function* watchSendPasswordLoop() {
  yield* takeEvery(PASSWORD_FORGOT.REQUEST, sendPasswordLoop);
}

export const forgotPasswordSagas = [
  fork(watchSendPasswordLoop),
];
