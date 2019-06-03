import { call, fork, put, all, takeLatest } from 'redux-saga/effects';

import log from '../../../utils/Logger.ts';

import { fetchNativeCreatives } from './actions';

import CreativeService from '../../../services/CreativeService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import { CREATIVES_NATIVE_FETCH } from '../../action-types';

function* loadNativeCreatives({ payload }) {
  try {
    const { organisationId, filter, isInitialRender } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    let options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      archived: filter.archived,
      subtype: ['NATIVE'],
    };

    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords,
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
        response: call(
          CreativeService.getDisplayAds,
          organisationId,
          options,
        ),
      };
    } else {
      allCalls = {
        response: call(
          CreativeService.getDisplayAds,
          organisationId,
          options,
        ),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.total > 0;
    }

    yield put(fetchNativeCreatives.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchNativeCreatives.failure(error));
  }
}

function* watchfetchNativeCreatives() {
  yield takeLatest(CREATIVES_NATIVE_FETCH.REQUEST, loadNativeCreatives);
}

export const nativeCreativesSagas = [fork(watchfetchNativeCreatives)];
