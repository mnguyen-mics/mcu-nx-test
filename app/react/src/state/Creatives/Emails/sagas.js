import { call, fork, put, all, takeLatest } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import { fetchCreativeEmails } from './actions';

import CreativeService from '../../../services/CreativeService.ts';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import { CREATIVES_EMAIL_FETCH } from '../../action-types';

function* loadCreativeEmails({ payload }) {
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
          CreativeService.getEmailTemplates,
          organisationId,
          initialOptions,
        ),
        response: call(
          CreativeService.getEmailTemplates,
          organisationId,
          options,
        ),
      };
    } else {
      allCalls = {
        response: call(
          CreativeService.getEmailTemplates,
          organisationId,
          options,
        ),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.total > 0;
    }

    yield put(fetchCreativeEmails.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchCreativeEmails.failure(error));
  }
}

function* watchfetchCreativeEmails() {
  yield takeLatest(CREATIVES_EMAIL_FETCH.REQUEST, loadCreativeEmails);
}

export const creativeEmailsSagas = [fork(watchfetchCreativeEmails)];
