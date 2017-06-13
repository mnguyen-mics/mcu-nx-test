import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchCreativeDisplay
} from './actions';

import DisplayAdsService from '../../../services/Creatives/DisplayAds';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    CREATIVES_DISPLAY_FETCH
} from '../../action-types';

function* loadCreativeDisplay({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      creative_type: 'DISPLAY_AD'
    };

    const response = yield call(DisplayAdsService.getCreativeDisplay, organisationId, options);

    yield put(fetchCreativeDisplay.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCreativeDisplay.failure(error));
  }
}

function* watchfetchCreativeDisplay() {
  yield* takeLatest(CREATIVES_DISPLAY_FETCH.REQUEST, loadCreativeDisplay);
}

export const creativeDisplaySagas = [
  fork(watchfetchCreativeDisplay)
];
