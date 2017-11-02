import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchEmailCampaign,
  fetchEmailCampaignDeliveryReport,
  updateEmailCampaign,
  fetchAllEmailBlast,
  fetchAllEmailBlastPerformance,
} from './actions';

import EmailCampaignService from '../../../services/EmailCampaignService';
import ReportService from '../../../services/ReportService';

import {
    EMAIL_CAMPAIGN_FETCH,
    EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH,
    EMAIL_CAMPAIGN_ARCHIVE,
    EMAIL_CAMPAIGN_UPDATE,
    EMAIL_CAMPAIGN_LOAD_ALL,
    EMAIL_BLAST_FETCH_ALL,
    EMAIL_BLAST_FETCH_PERFORMANCE,
} from '../../action-types';

function* loadEmailCampaign({ payload }) {
  try {

    const {
      campaignId,
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');

    const response = yield call(EmailCampaignService.getEmailCampaign, campaignId);
    yield put(fetchEmailCampaign.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchEmailCampaign.failure(error));
  }
}

function* loadDeliveryReport({ payload }) {
  try {

    const {
      organisationId,
      campaignId,
      filter,
    } = payload;

    if (!(organisationId || campaignId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'day';

    const response = yield call(ReportService.getSingleEmailDeliveryReport, organisationId, campaignId, startDate, endDate, dimension);
    yield put(fetchEmailCampaignDeliveryReport.success(response));
  } catch (error) {
    log.error(error);
    // TODO add meta data in order to show error in global notification
    yield put(fetchEmailCampaignDeliveryReport.failure(error));
  }
}

function* modifyEmailCampaign({ payload }) {
  try {

    const {
      campaignId,
      body,
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');

    const response = yield call(EmailCampaignService.updateCampaign, campaignId, body);
    yield put(updateEmailCampaign.success(response));
    yield put(fetchEmailCampaign.request(campaignId, body));
  } catch (error) {
    log.error(error);
    yield put(updateEmailCampaign.failure(error));
  }
}

function* loadAllEmailBlast({ payload }) {
  try {

    const {
      campaignId,
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');
    const response = yield call(EmailCampaignService.getBlasts, campaignId);
    yield put(fetchAllEmailBlast.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAllEmailBlast.failure(error));
  }
}

function* loadAllEmailBlastPerformance({ payload }) {
  try {

    const {
      organisationId,
      campaignId,
      filter,
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
  yield call(loadEmailCampaign, action);
  yield call(loadDeliveryReport, action);
}

function* watchFetchEmailCampaign() {
  yield* takeLatest(EMAIL_CAMPAIGN_FETCH.REQUEST, loadEmailCampaign);
}

function* watchFetchDeliveryReport() {
  yield* takeLatest(EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchUpdateEmailCampaign() {
  yield* takeLatest(EMAIL_CAMPAIGN_UPDATE.REQUEST, modifyEmailCampaign);
}

function* watchArchiveEmailCampaign() {
  yield* takeLatest(EMAIL_CAMPAIGN_ARCHIVE.REQUEST, modifyEmailCampaign);
}

function* watchLoadCampaignAndPerformance() {
  yield* takeLatest(EMAIL_CAMPAIGN_LOAD_ALL, loadCampaignAndPerformance);
}

function* watchLoadBlast() {
  yield* takeLatest([EMAIL_CAMPAIGN_LOAD_ALL, EMAIL_BLAST_FETCH_ALL.REQUEST], loadAllEmailBlast);
}

function* watchLoadBlastPerformance() {
  yield* takeLatest([EMAIL_CAMPAIGN_LOAD_ALL, EMAIL_BLAST_FETCH_PERFORMANCE.REQUEST], loadAllEmailBlastPerformance);
}

export const emailCampaignSagas = [
  fork(watchFetchEmailCampaign),
  fork(watchFetchDeliveryReport),
  fork(watchUpdateEmailCampaign),
  fork(watchArchiveEmailCampaign),
  fork(watchLoadCampaignAndPerformance),
  fork(watchLoadBlast),
  fork(watchLoadBlastPerformance),
];
