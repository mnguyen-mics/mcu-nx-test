import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchGoals,
  fetchGoalsPerformanceReport,
} from './actions';

import GoalService from '../../../services/GoalService';
import ReportService from '../../../services/ReportService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import {
  GOALS_FETCH,
  GOALS_LOAD_ALL,
  GOALS_PERFORMANCE_REPORT_FETCH,
} from '../../action-types';

function* loadPerformanceReport({ payload }) {
  try {

    const {
      organisationId,
      filter,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'goal_id';

    const response = yield call(ReportService.getConversionPerformanceReport, organisationId, startDate, endDate, dimension);
    yield put(fetchGoalsPerformanceReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchGoalsPerformanceReport.failure(error));
  }
}

function* loadGoals({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) { options.keywords = filter.keywords; }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(GoalService.getGoals, organisationId, initialOptions),
        response: call(GoalService.getGoals, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(GoalService.getGoals, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

    yield put(fetchGoals.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchGoals.failure(error));
  }
}

function* loadGoalsAndPerformance(action) {
  yield call(loadGoals, action);
  yield call(loadPerformanceReport, action);
}

function* watchFetchGoals() {
  yield* takeLatest(GOALS_FETCH.REQUEST, loadGoals);
}

function* watchFetchPerformanceReport() {
  yield* takeLatest(GOALS_PERFORMANCE_REPORT_FETCH.REQUEST, loadPerformanceReport);
}

function* watchLoadGoalsAndPerformance() {
  yield* takeLatest(GOALS_LOAD_ALL, loadGoalsAndPerformance);
}

export const goalsSagas = [
  fork(watchFetchGoals),
  fork(watchFetchPerformanceReport),
  fork(watchLoadGoalsAndPerformance),
];
