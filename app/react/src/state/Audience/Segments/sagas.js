import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchAudienceSegmentList,
    fetchAudienceSegmentsPerformanceReport
} from './actions';

import AudienceSegmentService from '../../../services/AudienceSegmentService';
import ReportService from '../../../services/ReportService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    AUDIENCE_SEGMENTS_LIST_FETCH,
    AUDIENCE_SEGMENTS_LOAD_ALL,
    AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH
} from '../../action-types';

function* loadPerformanceReport({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'audience_segment_id';
    // filters: `organisation_id==${organisationId}`,

    const response = yield call(ReportService.getAudienceSegmentReport, organisationId, startDate, endDate, dimension);
    yield put(fetchAudienceSegmentsPerformanceReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchAudienceSegmentsPerformanceReport.failure(error));
  }
}

function* loadAudienceSegmentList({ payload }) {
  try {

    const {
      organisationId,
      datamartId,
      filter,
      isInitialRender
    } = payload;

    if (!(organisationId || datamartId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    if (filter.keywords) { options.name = filter.keywords; }
    if (filter.types) { options.types = filter.types; }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1)
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(AudienceSegmentService.getSegments, organisationId, datamartId, initialOptions),
        response: call(AudienceSegmentService.getSegments, organisationId, datamartId, options)
      };
    } else {
      allCalls = {
        response: call(AudienceSegmentService.getSegments, organisationId, datamartId, options)
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      if (initialFetch.count > 0) {
        response.hasItems = true;
      } else {
        response.hasItems = false;
      }
    }

    yield put(fetchAudienceSegmentList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAudienceSegmentList.failure(error));
  }
}

function* loadSegmentsAndPerformance(action) {
  yield call(loadAudienceSegmentList, action);
  yield call(loadPerformanceReport, action);
}

function* watchFetchAudienceSegmentsList() {
  yield* takeLatest(AUDIENCE_SEGMENTS_LIST_FETCH.REQUEST, loadAudienceSegmentList);
}

function* watchFetchPerformanceReport() {
  yield* takeLatest(AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.REQUEST, loadPerformanceReport);
}

function* watchLoadSegmentsAndPerformance() {
  yield* takeLatest(AUDIENCE_SEGMENTS_LOAD_ALL, loadSegmentsAndPerformance);
}

export const segmentsSagas = [
  fork(watchFetchAudienceSegmentsList),
  fork(watchFetchPerformanceReport),
  fork(watchLoadSegmentsAndPerformance)
];
