import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchKeywordLists,
} from './actions';

import KeywordListsService from '../../../services/Library/KeywordListsService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    KEYWORD_LISTS_FETCH,
} from '../../action-types';

function* loadKeywordLists({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender,
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(KeywordListsService.getKeywordLists, organisationId, initialOptions),
        response: call(KeywordListsService.getKeywordLists, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(KeywordListsService.getKeywordLists, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

    yield put(fetchKeywordLists.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchKeywordLists.failure(error));
  }
}

function* watchfetchKeywordLists() {
  yield* takeLatest(KEYWORD_LISTS_FETCH.REQUEST, loadKeywordLists);
}

export const keywordListsSagas = [
  fork(watchfetchKeywordLists),
];
