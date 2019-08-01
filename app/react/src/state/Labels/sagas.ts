import { call, fork, put, takeLatest, getContext } from 'redux-saga/effects';
import log from '../../utils/Logger';
import { fetchAllLabels } from './actions';

import { LABELS_FETCH } from '../action-types';

function* loadLabels({ payload }: any) {
  const _labelService = yield getContext('labelService');
  try {
    const { organisationId } = payload;

    if (!organisationId) throw new Error('Payload is invalid');
    const response = yield call(_labelService.getLabels, organisationId, {
      limit: 1000,
    });
    yield put(fetchAllLabels.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAllLabels.failure(error));
  }
}

function* watchFetchLabels() {
  yield takeLatest(LABELS_FETCH.REQUEST, loadLabels);
}

export const labelsSagas = [fork(watchFetchLabels)];
