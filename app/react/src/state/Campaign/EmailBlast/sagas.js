import { takeLatest } from 'redux-saga';
import { call, fork, put, select } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchEmailBlast,
  fetchEmailBlastDeliveryReport,
  loadEmailBlastAndDeliveryReport,
  archiveEmailBlast,
  updateEmailBlast,
  resetEmailBlast
} from './actions';

import {
  getWorkspaceOrganisationId
} from '../../Session/selectors';

import CampaignService from '../../../services/CampaignService';
import ReportService from '../../../services/ReportService';

import {
    EMAIL_BLAST_FETCH,
    EMAIL_BLAST_DELIVERY_REPORT_FETCH,
    EMAIL_BLAST_ARCHIVE,
    EMAIL_BLAST_UPDATE,
    EMAIL_BLAST_LOAD_ALL
} from '../../action-types';

function* loadAllEmailBlast({ payload }) {
  try {

    const response = yield call(CampaignService.getCampaignEmail);
    yield put(fetchCampaignEmail.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCampaignEmail.failure(error));
  }
}

function* loadOneEmailBlast({ payload }) {
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
      campaignId,
      filter
    } = payload;

    if (!(campaignId || filter)) throw new Error('Payload is invalid');

    const startDate = filter.from;
    const endDate = filter.to;
    const dimension = 'day';

    const currentOrganisationId = yield select(getWorkspaceOrganisationId);

    const response = yield call(ReportService.getSingleEmailDeliveryReport, currentOrganisationId, campaignId, startDate, endDate, dimension);
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

function* loadCampaignAndPerformance(action) {
  yield call(loadCampaignEmail, action);
  yield call(loadDeliveryReport, action);
}

function* watchFetchCampaignEmail() {
  yield* takeLatest(EMAIL_BLAST_FETCH.REQUEST, loadCampaignEmail);
}

function* watchFetchDeliveryReport() {
  yield* takeLatest(EMAIL_BLAST_DELIVERY_REPORT_FETCH.REQUEST, loadDeliveryReport);
}

function* watchUpdateCampaignEmail() {
  yield* takeLatest(EMAIL_BLAST_UPDATE.REQUEST, modifyCampaignEmail);
}

function* watchArchiveCampaignEmail() {
  yield* takeLatest(EMAIL_BLAST_ARCHIVE.REQUEST, modifyCampaignEmail);
}

function* watchLoadCampaignAndPerformance() {
  yield* takeLatest(EMAIL_BLAST_LOAD_ALL, loadCampaignAndPerformance);
}

export const campaignEmailSagas = [
  fork(watchFetchCampaignEmail),
  fork(watchFetchDeliveryReport),
  fork(watchUpdateCampaignEmail),
  fork(watchArchiveCampaignEmail),
  fork(watchLoadCampaignAndPerformance)
];
