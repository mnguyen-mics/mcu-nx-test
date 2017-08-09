import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchPlacementLists,
} from './actions';

import PlacementListsService from '../../../services/Library/PlacementListsService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    PLACEMENT_LISTS_FETCH,
} from '../../action-types';

function* loadPlacementLists({ payload }) {
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
        initialFetch: call(PlacementListsService.getPlacementLists, organisationId, initialOptions),
        response: call(PlacementListsService.getPlacementLists, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(PlacementListsService.getPlacementLists, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

    yield put(fetchPlacementLists.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchPlacementLists.failure(error));
  }
}

function* watchfetchPlacementLists() {
  yield* takeLatest(PLACEMENT_LISTS_FETCH.REQUEST, loadPlacementLists);
}

export const placementListsSagas = [
  fork(watchfetchPlacementLists),
];
