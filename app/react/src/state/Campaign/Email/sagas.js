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
    CAMPAIGN_EMAIL_FETCH,
    CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH,
    CAMPAIGN_EMAIL_ARCHIVE,
    CAMPAIGN_EMAIL_UPDATE,
    CAMPAIGN_EMAIL_LOAD_ALL,
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

    const response = yield call(EmailCampaignService.updateEmailCampaign, campaignId, body);
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

function* loadAllEmailBlastPErformance({ payload }) {
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
  yield* takeLatest(CAMPAIGN_EMAIL_FETCH.REQUEST, loadEmailCampaign);
}

function* watchFetchDeliveryReport() {
  yield* takeLatest(CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchUpdateEmailCampaign() {
  yield* takeLatest(CAMPAIGN_EMAIL_UPDATE.REQUEST, modifyEmailCampaign);
}

function* watchArchiveEmailCampaign() {
  yield* takeLatest(CAMPAIGN_EMAIL_ARCHIVE.REQUEST, modifyEmailCampaign);
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
  fork(watchFetchEmailCampaign),
  fork(watchFetchDeliveryReport),
  fork(watchUpdateEmailCampaign),
  fork(watchArchiveEmailCampaign),
  fork(watchLoadCampaignAndPerformance),
  fork(watchLoadBlast),
  fork(watchLoadBlastPerformance),
];
