import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
  fetchCampaignEmail,
  updateCampaignEmail,
  archiveCampaignEmail
} from './actions';

import CampaignService from '../../../services/CampaignService';

import {
    CAMPAIGN_EMAIL_FETCH,
    CAMPAIGN_EMAIL_ARCHIVE,
    CAMPAIGN_EMAIL_UPDATE,
    CAMPAIGN_EMAIL_LOAD_ALL
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

function* modifyCampaignEmail({ payload }) {
  try {

    const {
      campaignId,
      body
    } = payload;

    if (!campaignId) throw new Error('Payload is invalid');

    const response = yield call(CampaignService.updateCampaignEmail, campaignId, body);
    yield put(updateCampaignEmail.success(response));
  } catch (error) {
    log.error(error);
    yield put(updateCampaignEmail.failure(error));
  }
}

function* loadCampaignAndPerformance(action) {
  yield call(loadCampaignEmail, action);
}

function* watchFetchCampaignEmail() {
  yield* takeLatest(CAMPAIGN_EMAIL_FETCH.REQUEST, loadCampaignEmail);
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

export const campaignEmailSagas = [
  fork(watchFetchCampaignEmail),
  fork(watchUpdateCampaignEmail),
  fork(watchArchiveCampaignEmail),
  fork(watchLoadCampaignAndPerformance)
];
