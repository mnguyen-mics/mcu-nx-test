import { takeLatest, delay } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';
import moment from 'moment';

import log from '../../../utils/Logger';
import { normalizeReportView } from '../../../utils/MetricHelper';

import {
    fetchAudienceSegmentList,
    fetchAudienceSegmentsPerformanceReport,
    fetchAudienceSegmentSingle,
    fetchAudienceSegmentSinglePerformanceReport,
    createAudienceSegmentOverlap,
    fetchAudienceSegmentOverlap
} from './actions';

import AudienceSegmentService from '../../../services/AudienceSegmentService';
import DataFileService from '../../../services/DataFileService';
import ReportService from '../../../services/ReportService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    AUDIENCE_SEGMENTS_LIST_FETCH,
    AUDIENCE_SEGMENTS_LOAD_ALL,
    AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH,
    AUDIENCE_SEGMENT_SINGLE_LOAD_ALL,
    AUDIENCE_SEGMENT_SINGLE_FETCH,
    AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH,
    AUDIENCE_SEGMENT_SINGLE_RESET,
    AUDIENCE_SEGMENT_CREATE_OVERLAP,
    AUDIENCE_SEGMENT_RETRIEVE_OVERLAP
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

function* loadSinglePerformanceReport({ payload }) {
  try {

    const {
      segmentId,
      organisationId,
      filter
    } = payload;

    if (!(segmentId || organisationId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'day';
    const filters = {
      filters: `audience_segment_id==${segmentId}`,
    };

    const response = yield call(ReportService.getAudienceSegmentReport, organisationId, startDate, endDate, dimension, ['user_points', 'user_accounts', 'emails,desktop_cookie_ids', 'user_point_additions', 'user_point_deletions'], filters);
    yield put(fetchAudienceSegmentSinglePerformanceReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchAudienceSegmentSinglePerformanceReport.failure(error));
  }
}

function* loadAudienceSegmentSingle({ payload }) {
  try {

    const {
      segmentId,
      organisationId
    } = payload;
    if (!(segmentId)) throw new Error('Payload is invalid');

    const response = yield call(AudienceSegmentService.getSegment, segmentId);
    const perfResponse = yield call(ReportService.getAudienceSegmentReport, organisationId, moment().subtract(1, 'days'), moment(), 'day', ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids'], { filters: `audience_segment_id==${segmentId}` });
    response.data.report_view = normalizeReportView(perfResponse.data.report_view);
    yield put(fetchAudienceSegmentSingle.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchAudienceSegmentSingle.failure(error));
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
      response.hasItems = initialFetch.count > 0;
    }
    yield put(fetchAudienceSegmentList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAudienceSegmentList.failure(error));
  }
}

function* postAudienceSegmentOverlap({ payload }) {
  try {

    const {
      datamartId,
      segmentId,
      organisationId,
      filter
    } = payload;

    if (!(datamartId || segmentId || filter)) throw new Error('Payload is invalid');

    const response = yield call(AudienceSegmentService.createOverlap, datamartId, segmentId, filter);
    yield put(createAudienceSegmentOverlap.success(response));
    yield put(fetchAudienceSegmentOverlap.request(segmentId, organisationId, datamartId));
  } catch (error) {
    log.error(error);
    yield put(createAudienceSegmentOverlap.failure(error));
  }
}

function* retrieveAudienceSegmentOverlap({ payload }) {
  try {

    const {
      segmentId,
      filter,
      organisationId,
      datamartId
    } = payload;

    if (!(segmentId || filter)) throw new Error('Payload is invalid');

    const formatedFilters = {
      first_result: 0,
      max_results: 1,
      ...filter,
    };

    const response = yield call(AudienceSegmentService.retrieveOverlap, segmentId, formatedFilters.first_result, formatedFilters.max_results);

    let formatedResponse;
    if (response.data.length > 0) {
      if (response.data[0].status === 'SUCCEEDED') {
        const micsUri = response.data[0].output_result.result.data_file_uri;
        const overlapData = yield call(DataFileService.getDatafileData, micsUri);
        formatedResponse = {
          ...overlapData,
          hasOverlap: true
        };
      } else if (response.data[0].status === 'PENDING' || response.data[0].status === 'RUNNING') {

        let responseStatus = response.data[0].status;

        while (responseStatus !== 'SUCCEEDED') {

          const test = yield call(AudienceSegmentService.retrieveOverlap, segmentId, formatedFilters.first_result, formatedFilters.max_results);
          if (test.data[0].status === 'SUCCEEDED') {
            responseStatus = test.data[0].status;
            const micsUri = test.data[0].output_result.result.data_file_uri;
            const overlapData = yield call(DataFileService.getDatafileData, micsUri);
            formatedResponse = {
              ...overlapData,
              hasOverlap: true
            };
          }
          yield call(delay, 1 * 1000);
        }
      }
    } else {
      formatedResponse = {
        date: 0,
        segments: [],
        overlaps: [],
        hasOverlap: false
      };
    }

    const options = {
      ...getPaginatedApiParam(1, formatedResponse.segments.length - 1)
    };
    if (formatedResponse.overlaps.length > 0) {
      const segmentList = yield call(AudienceSegmentService.getSegments, organisationId, datamartId, options);
      yield put(fetchAudienceSegmentList.success(segmentList));
    }
    yield put(fetchAudienceSegmentOverlap.success(formatedResponse));

  } catch (error) {
    log.error(error);
    yield put(fetchAudienceSegmentOverlap.failure(error));
  }
}

function* loadSegmentsAndPerformance(action) {
  yield call(loadAudienceSegmentList, action);
  yield call(loadPerformanceReport, action);
}

function* loadSingleSegmentAndPerformance(action) {
  yield call(loadAudienceSegmentSingle, action);
  yield call(loadSinglePerformanceReport, action);
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

function* watchLoadSingleSegmentAndPerformance() {
  yield* takeLatest(AUDIENCE_SEGMENT_SINGLE_LOAD_ALL, loadSingleSegmentAndPerformance);
}

function* watchCreateAudienceSegmentOverlap() {
  yield* takeLatest(AUDIENCE_SEGMENT_CREATE_OVERLAP.REQUEST, postAudienceSegmentOverlap);
}

function* watchRetrieveAudienceSegmentOverlap() {
  yield* takeLatest(AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.REQUEST, retrieveAudienceSegmentOverlap);
}

export const segmentsSagas = [
  fork(watchFetchAudienceSegmentsList),
  fork(watchFetchPerformanceReport),
  fork(watchLoadSegmentsAndPerformance),
  fork(watchLoadSingleSegmentAndPerformance),
  fork(watchCreateAudienceSegmentOverlap),
  fork(watchRetrieveAudienceSegmentOverlap)
];
