import { call, fork, put, all, takeLatest } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchEmailCampaignsDeliveryReport,
  fetchEmailCampaignsList,
} from './actions';

import CampaignService from '../../../services/CampaignService.ts';
import ReportService from '../../../services/ReportService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import {
  EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH,
  EMAIL_CAMPAIGNS_LIST_FETCH,
  EMAIL_CAMPAIGNS_LOAD_ALL,
} from '../../action-types';

function* loadDeliveryReport({ payload }) {
  try {

    const {
      organisationId,
      filter,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'campaign_id';

    const response = yield call(ReportService.getEmailDeliveryReport, organisationId, startDate, endDate, dimension);
    yield put(fetchEmailCampaignsDeliveryReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchEmailCampaignsDeliveryReport.failure(error));
  }
}

function* loadEmailCampaignsList({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const campaignType = 'EMAIL';

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

    yield put(fetchEmailCampaignsList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchEmailCampaignsList.failure(error));
  }
}

function* loadCampaignsAndPerformance(action) {
  yield call(loadEmailCampaignsList, action);
  yield call(loadDeliveryReport, action);
}

function* watchFetchEmailCampaigns() {
  yield takeLatest(EMAIL_CAMPAIGNS_LIST_FETCH.REQUEST, loadEmailCampaignsList);
}

function* watchFetchDeliveryReport() {
  yield takeLatest(EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchLoadCampaignsAndPerformance() {
  yield takeLatest(EMAIL_CAMPAIGNS_LOAD_ALL, loadCampaignsAndPerformance);
}

export const emailCampaignsSagas = [
  fork(watchFetchEmailCampaigns),
  fork(watchFetchDeliveryReport),
  fork(watchLoadCampaignsAndPerformance),
];
