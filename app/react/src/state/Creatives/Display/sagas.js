import { call, fork, put, all, takeLatest } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import { fetchCreativeDisplay } from './actions';

import CreativeService from '../../../services/CreativeService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import { CREATIVES_DISPLAY_FETCH } from '../../action-types';

function* loadCreativeDisplay({ payload }) {
  try {
    const { organisationId, filter, isInitialRender } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    let options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      archived: filter.archived,
    };

    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords
      };
    }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(
          CreativeService.getDisplayAds,
          organisationId,
          initialOptions,
        ),
        response: call(CreativeService.getDisplayAds, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(CreativeService.getDisplayAds, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.total > 0;
    }

    yield put(fetchCreativeDisplay.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCreativeDisplay.failure(error));
  }
}

function* watchfetchCreativeDisplay() {
  yield takeLatest(CREATIVES_DISPLAY_FETCH.REQUEST, loadCreativeDisplay);
}

export const creativeDisplaySagas = [fork(watchfetchCreativeDisplay)];
