import { takeLatest } from 'redux-saga';
import { call, fork, put, select } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchCampaignEmail,
  fetchCampaignEmailDeliveryReport,
  updateCampaignEmail,
  archiveCampaignEmail,
  fetchAllEmailBlast,
  fetchAllEmailBlastPerformance
} from './actions';

import CampaignService from '../../../services/CampaignService';
import ReportService from '../../../services/ReportService';

import {
    CAMPAIGN_EMAIL_FETCH,
    CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH,
    CAMPAIGN_EMAIL_ARCHIVE,
    CAMPAIGN_EMAIL_UPDATE,
    CAMPAIGN_EMAIL_LOAD_ALL,
    EMAIL_BLAST_FETCH_ALL,
    EMAIL_BLAST_FETCH_PERFORMANCE
} from '../../action-types';

function* loadCampaignEmail({ payload }) {
  try {

    const {
      campaignId
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');

    const response = yield call(CampaignService.getCampaignEmail, campaignId);
    yield put(fetchCampaignEmail.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCampaignEmail.failure(error));
  }
}

function* loadDeliveryReport({ payload }) {
  try {

    const {
      organisationId,
      campaignId,
      filter
    } = payload;

    if (!(organisationId || campaignId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'day';

    const response = yield call(ReportService.getSingleEmailDeliveryReport, organisationId, campaignId, startDate, endDate, dimension);
    yield put(fetchCampaignEmailDeliveryReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchCampaignEmailDeliveryReport.failure(error));
  }
}

function* modifyCampaignEmail({ payload }) {
  try {

    const {
      campaignId,
      body
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');

    const response = yield call(CampaignService.updateCampaignEmail, campaignId, body);
    yield put(updateCampaignEmail.success(response));
    yield put(fetchCampaignEmail.request(campaignId, body));
  } catch (error) {
    log.error(error);
    yield put(updateCampaignEmail.failure(error));
  }
}

function* loadAllEmailBlast({ payload }) {
  try {

    const {
      campaignId
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');
    const response = yield call(CampaignService.getAllEmailBlast, campaignId);
    yield put(fetchAllEmailBlast.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAllEmailBlast.failure(error));
  }
}

function* loadAllEmailBlastPErformance({ payload }) {
  try {

    const {
      organisationId,
      campaignId,
      filter
    } = payload;

    if (!(organisationId || campaignId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'blast_id';

    const response = yield call(ReportService.getAllEmailBlastPerformance, organisationId, campaignId, startDate, endDate, dimension);
    yield put(fetchAllEmailBlastPerformance.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAllEmailBlastPerformance.failure(error));
  }
}

function* loadCampaignAndPerformance(action) {
  yield call(loadCampaignEmail, action);
  yield call(loadDeliveryReport, action);
}

function* watchFetchCampaignEmail() {
  yield* takeLatest(CAMPAIGN_EMAIL_FETCH.REQUEST, loadCampaignEmail);
}

function* watchFetchDeliveryReport() {
  yield* takeLatest(CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchUpdateCampaignEmail() {
  yield* takeLatest(CAMPAIGN_EMAIL_UPDATE.REQUEST, modifyCampaignEmail);
}

function* watchArchiveCampaignEmail() {
  yield* takeLatest(CAMPAIGN_EMAIL_ARCHIVE.REQUEST, modifyCampaignEmail);
}

function* watchLoadCampaignAndPerformance() {
  yield* takeLatest(CAMPAIGN_EMAIL_LOAD_ALL, loadCampaignAndPerformance);
}

function* watchLoadBlast() {
  yield* takeLatest(CAMPAIGN_EMAIL_LOAD_ALL, loadAllEmailBlast);
}

function* watchLoadBlastPerformance() {
  yield* takeLatest(CAMPAIGN_EMAIL_LOAD_ALL, loadAllEmailBlastPErformance);
}

export const campaignEmailSagas = [
  fork(watchFetchCampaignEmail),
  fork(watchFetchDeliveryReport),
  fork(watchUpdateCampaignEmail),
  fork(watchArchiveCampaignEmail),
  fork(watchLoadCampaignAndPerformance),
  fork(watchLoadBlast),
  fork(watchLoadBlastPerformance)
];
