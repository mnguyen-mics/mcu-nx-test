import { takeEvery } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../utils/Logger';

import { fetchEmailRouters } from './actions';

import EmailRouterService from '../../services/EmailRouterService.ts';

import { EMAIL_ROUTER_LIST_FETCH } from '../action-types';

function* loadEmailRouters({ payload }) {
  try {

    const {
      organisationId,
    } = payload;

    const response = yield call(EmailRouterService.getRouters, organisationId);

    yield put(fetchEmailRouters.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchEmailRouters.failure(error));
  }
}

function* watchFetchEmailRouters() {
  yield* takeEvery(EMAIL_ROUTER_LIST_FETCH.REQUEST, loadEmailRouters);
}

export const emailRoutersSagas = [fork(watchFetchEmailRouters)];
