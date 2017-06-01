import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchCreativeEmails
} from './actions';

import DisplayAdsService from '../../../services/Creatives/DisplayAds';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    CREATIVES_EMAILS_FETCH
} from '../../action-types';

function* loadCreativeEmails({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      creative_type: 'EMAIL_TEMPLATE'
    };
    const response = yield call(DisplayAdsService.getCreativeDisplay, organisationId, options);

    yield put(fetchCreativeEmails.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCreativeEmails.failure(error));
  }
}

function* watchfetchCreativeEmails() {
  yield* takeLatest(CREATIVES_EMAILS_FETCH.REQUEST, loadCreativeEmails);
}

export const creativeEmailsSagas = [
  fork(watchfetchCreativeEmails)
];
