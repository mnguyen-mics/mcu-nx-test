import { call, fork, put, takeLatest } from 'redux-saga/effects';

import log from '../../utils/Logger';

import {
  fetchAllLabels,
} from './actions';

/*
import {
  getWorkspaceOrganisationId
} from '../Session/selectors';
*/

import LabelsService from '../../services/LabelsService.ts';

import {
  LABELS_FETCH,
} from '../action-types';

function* loadLabels({ payload }) {
  try {

    const {
      organisationId,
    } = payload;

    if (!(organisationId)) throw new Error('Payload is invalid');
    const response = yield call(LabelsService.getLabels, organisationId, { limit: 1000 });
    yield put(fetchAllLabels.success(response));

  } catch (error) {
    log.error(error);
    yield put(fetchAllLabels.failure(error));
  }
}


function* watchFetchLabels() {
  yield takeLatest(LABELS_FETCH.REQUEST, loadLabels);
}


export const labelsSagas = [
  fork(watchFetchLabels),
];
