import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchCampaignsDisplayList,
  fetchCampaignsDisplayPerformanceReport
} from './actions';

import CampaignService from '../../../services/CampaignService';
import ReportService from '../../../services/ReportService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    CAMPAIGNS_DISPLAY_LIST_FETCH,
    CAMPAIGNS_DISPLAY_LOAD_ALL,
    CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH
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
    const dimension = '';

    const response = yield call(ReportService.getDisplayCampaignPerfomanceReport, organisationId, startDate, endDate, dimension);
    yield put(fetchCampaignsDisplayPerformanceReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchCampaignsDisplayPerformanceReport.failure(error));
  }
}

function* loadCampaignsDisplayList({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const campaignType = 'DISPLAY';

    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) { options.keywords = filter.keywords; }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1)
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(CampaignService.getCampaigns, organisationId, campaignType, initialOptions),
        response: call(CampaignService.getCampaigns, organisationId, campaignType, options)
      };
    } else {
      allCalls = {
        response: call(CampaignService.getCampaigns, organisationId, campaignType, options)
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

    yield put(fetchCampaignsDisplayList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCampaignsDisplayList.failure(error));
  }
}

function* loadCampaignsAndPerformance(action) {
  yield call(loadCampaignsDisplayList, action);
  yield call(loadPerformanceReport, action);
}

function* watchFetchCampaignsDisplay() {
  yield* takeLatest(CAMPAIGNS_DISPLAY_LIST_FETCH.REQUEST, loadCampaignsDisplayList);
}

function* watchFetchPerformanceReport() {
  yield* takeLatest(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.REQUEST, loadPerformanceReport);
}

function* watchLoadCampaignsAndPerformance() {
  yield* takeLatest(CAMPAIGNS_DISPLAY_LOAD_ALL, loadCampaignsAndPerformance);
}

export const campaignsDisplaySagas = [
  fork(watchFetchCampaignsDisplay),
  fork(watchFetchPerformanceReport),
  fork(watchLoadCampaignsAndPerformance)
];
