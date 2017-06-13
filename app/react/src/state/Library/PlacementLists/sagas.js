import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchPlacementLists
} from './actions';

import PlacementListsService from '../../../services/Library/PlacementListsService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    PLACEMENT_LISTS_FETCH
} from '../../action-types';

function* loadPlacementLists({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const response = yield call(PlacementListsService.getPlacementLists, organisationId, options);
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
  fork(watchfetchPlacementLists)
];
