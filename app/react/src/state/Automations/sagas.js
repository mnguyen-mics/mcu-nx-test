import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../utils/Logger';

import {
  fetchAutomations,
} from './actions';

import ScenarioService from '../../services/ScenarioService';

import { getPaginatedApiParam } from '../../utils/ApiHelper.ts';

import {
  AUTOMATIONS_LIST_FETCH,
} from '../action-types';

function* loadAutomations({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(ScenarioService.getScenarios, organisationId, initialOptions),
        response: call(ScenarioService.getScenarios, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(ScenarioService.getScenarios, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

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
  fork(watchFetchAutomations),
];
