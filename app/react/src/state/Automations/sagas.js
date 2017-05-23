import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../utils/Logger';

import {
    fetchAutomations
} from './actions';

import ScenarioService from '../../services/ScenarioService';

import { getPaginatedApiParam } from '../../utils/ApiHelper';

import {
    AUTOMATIONS_LIST_FETCH
} from '../action-types';

function* loadAutomations({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const response = yield call(ScenarioService.getScenarios, organisationId, options);
    yield put(fetchAutomations.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAutomations.failure(error));
  }
}

function* watchFetchAutomations() {
  yield* takeLatest(AUTOMATIONS_LIST_FETCH.REQUEST, loadAutomations);
}

export const automationsSagas = [
  fork(watchFetchAutomations)
];
