import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import { fetchCreativeEmails } from './actions';

import CreativeService from '../../../services/CreativeService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import { CREATIVES_EMAIL_FETCH } from '../../action-types';

function* loadCreativeEmails({ payload }) {
  try {

    const {
      organisationId,
      filter,
      isInitialRender
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const initialOptions = {
      ...getPaginatedApiParam(1, 1)
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(CreativeService.getEmailTemplates, organisationId, initialOptions),
        response: call(CreativeService.getEmailTemplates, organisationId, options)
      };
    } else {
      allCalls = {
        response: call(CreativeService.getEmailTemplates, organisationId, options)
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
  yield* takeLatest(CREATIVES_EMAIL_FETCH.REQUEST, loadCreativeEmails);
}

export const creativeEmailsSagas = [fork(watchfetchCreativeEmails)];
