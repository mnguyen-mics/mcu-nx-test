import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchDisplayCampaignsList,
  fetchDisplayCampaignsPerformanceReport
} from './actions';

import CampaignService from '../../../services/CampaignService.ts';
import ReportService from '../../../services/ReportService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';


import {
    DISPLAY_CAMPAIGNS_LIST_FETCH,
    DISPLAY_CAMPAIGNS_LOAD_ALL,
    DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH
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
    const dimension = '';

    const response = yield call(ReportService.getDisplayCampaignPerformanceReport, organisationId, startDate, endDate, dimension);
    yield put(fetchDisplayCampaignsPerformanceReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchDisplayCampaignsPerformanceReport.failure(error));
  }
}

function* loadDisplayCampaignsList({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const campaignType = 'DISPLAY';

    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) { options.keywords = filter.keywords; }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(CampaignService.getCampaigns, organisationId, campaignType, initialOptions),
        response: call(CampaignService.getCampaigns, organisationId, campaignType, options),
      };
    } else {
      allCalls = {
        response: call(CampaignService.getCampaigns, organisationId, campaignType, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

    yield put(fetchDisplayCampaignsList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchDisplayCampaignsList.failure(error));
  }
}

function* loadCampaignsAndPerformance(action) {
  yield call(loadDisplayCampaignsList, action);
  yield call(loadPerformanceReport, action);
}

function* watchFetchDisplayCampaigns() {
  yield* takeLatest(DISPLAY_CAMPAIGNS_LIST_FETCH.REQUEST, loadDisplayCampaignsList);
}

function* watchFetchPerformanceReport() {
  yield* takeLatest(DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.REQUEST, loadPerformanceReport);
}

function* watchLoadCampaignsAndPerformance() {
  yield* takeLatest(DISPLAY_CAMPAIGNS_LOAD_ALL, loadCampaignsAndPerformance);
}

export const displayCampaignsSagas = [
  fork(watchFetchDisplayCampaigns),
  fork(watchFetchPerformanceReport),
  fork(watchLoadCampaignsAndPerformance),
];
