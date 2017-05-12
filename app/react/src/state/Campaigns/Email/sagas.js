import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchCampaignsEmailDeliveryReport,
  fetchCampaignsEmailList
} from './actions';

import CampaignService from '../../../services/CampaignService';
import ReportService from '../../../services/ReportService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGNS_EMAIL_LIST_FETCH,
  CAMPAIGNS_EMAIL_LOAD_ALL
} from '../../action-types';

function* loadDeliveryReport({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'campaign_id';

    const response = yield call(ReportService.getEmailDeliveryReport, organisationId, startDate, endDate, dimension);
    yield put(fetchCampaignsEmailDeliveryReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchCampaignsEmailDeliveryReport.failure(error));
  }
}

function* loadCampaignsEmailList({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const campaignType = 'EMAIL';

    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) { options.keywords = filter.keywords; }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    const response = yield call(CampaignService.getCampaigns, organisationId, campaignType, options);
    yield put(fetchCampaignsEmailList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCampaignsEmailList.failure(error));
  }
}

function* loadCampaignsAndPerformance(action) {
  yield call(loadCampaignsEmailList, action);
  yield call(loadDeliveryReport, action);
}

function* watchFetchCampaignsEmail() {
  yield* takeLatest(CAMPAIGNS_EMAIL_LIST_FETCH.REQUEST, loadCampaignsEmailList);
}

function* watchFetchDeliveryReport() {
  yield* takeLatest(CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchLoadCampaignsAndPerformance() {
  yield* takeLatest(CAMPAIGNS_EMAIL_LOAD_ALL, loadCampaignsAndPerformance);
}

export const campaignsEmailSagas = [
  fork(watchFetchCampaignsEmail),
  fork(watchFetchDeliveryReport),
  fork(watchLoadCampaignsAndPerformance)
];
