import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchKeywordLists
} from './actions';

import KeywordListsService from '../../../services/Library/KeywordListsService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    KEYWORD_LISTS_FETCH
} from '../../action-types';

function* loadKeywordLists({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const response = yield call(KeywordListsService.getKeywordLists, organisationId, options);
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
  fork(watchfetchKeywordLists)
];
