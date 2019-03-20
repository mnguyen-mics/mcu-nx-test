import { call, fork, put, takeEvery, all, select } from 'redux-saga/effects';
import log from '../../utils/Logger';

import { fetchAllAudienceSegmentMetrics } from './actions';

import DatamartService from '../../services/DatamartService.ts';
import { CONNECTED_USER } from '../action-types';

function* loadAudienceSegmentMetrics(datamartId) {
  try {
    if (!datamartId) throw new Error('Payload is invalid');
    const response = yield call(
      DatamartService.getAudienceSegmentMetrics,
      datamartId,
    );
    return response && response.data ? response.data : {};

    // yield put(fetchAudienceSegmentMetrics.success(response));
  } catch (error) {
    log.error(error);
    return undefined;
    // yield put(fetchAudienceSegmentMetrics.failure(error));
  }
}

function* getAllUniqueDatamartIds() {
  const getSession = state => state.session;
  const session = yield select(getSession);
  const workspaces = session.connectedUser.workspaces;
  const datamartIds = [];
  workspaces.map(ws =>
    ws.datamarts.map(dm => {
      return datamartIds.push(dm.id);
    }),
  );
  return [...new Set(datamartIds)]; // unique datamartIds
}

function* loadAllAudienceSegmentMetrics() {
  try {
    const datamartIds = yield getAllUniqueDatamartIds();

    const list = yield all(
      datamartIds.map(datamartId => {
        return call(loadAudienceSegmentMetrics, datamartId);
      }),
    );

    const filteredList = list.filter(el => el && el.length);
    const metricsByDatamartId = filteredList.reduce((acc, current) => {
      const datamartId = current[0].datamart_id;
      return {
        ...acc,
        [datamartId]: current.filter(metric => metric.status === 'LIVE'),
      };
    }, {});

    yield put(fetchAllAudienceSegmentMetrics.success(metricsByDatamartId));
  } catch (error) {
    log.error(error);
    yield put(fetchAllAudienceSegmentMetrics.failure(error));
  }
}

function* watchFetchAllAudienceSegmentMetrics() {
  yield takeEvery(CONNECTED_USER.SUCCESS, loadAllAudienceSegmentMetrics);
}

export const audienceSegmentMetricsSagas = [
  fork(watchFetchAllAudienceSegmentMetrics),
];
