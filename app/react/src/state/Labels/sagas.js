import { takeLatest, takeEvery } from 'redux-saga';
import { call, fork, put, select } from 'redux-saga/effects';

import log from '../../utils/Logger';

import {
  fetchAllLabels,
  fetchLabelsOfObjects,
  createLabels,
  pairLabelWithObject,
  unPairLabelWithObject,
  updateLabels,
  resetLabels
} from './actions';

import {
  getWorkspaceOrganisationId
} from '../Session/selectors';

import LabelsService from '../../services/LabelsService';

import {
  LABELS_ARCHIVE,
  LABELS_FETCH,
  LABELS_CREATE,
  LABELS_UPDATE,
  LABELS_PAIR,
  LABELS_UNPAIR,
  LABELS_RESET,
  LABELS_OBJECT_FETCH
} from '../action-types';

function* loadLabels({ payload }) {
  try {

    const {
      organisationId,
    } = payload;

    if (!(organisationId)) throw new Error('Payload is invalid');

    const response = yield call(LabelsService.getLabels, organisationId);
    yield put(fetchAllLabels.success(response));

  } catch (error) {
    log.error(error);
    yield put(fetchAllLabels.failure(error));
  }
}

function* loadLabelsAttached({ payload }) {
  try {

    const {
      organisationId,
      labelableId,
      labelableType
    } = payload;

    if (!(organisationId) || !(labelableId) || !(labelableType)) throw new Error('Payload is invalid');
    const option = {};
    if (labelableId !== '') {
      option.labelable_id = labelableId;
    }
    if (labelableType !== '') {
      option.labelable_type = labelableType;
    }

    const response = yield call(LabelsService.getLabels, organisationId, option);
    yield put(fetchLabelsOfObjects.success(response));

  } catch (error) {
    log.error(error);
    yield put(fetchLabelsOfObjects.failure(error));
  }
}

function* modifyLabels(labelId, body) {
  try {

    const response = yield call(LabelsService.updateLabel, labelId, body);
    yield put(updateLabels.success(response));

  } catch (error) {
    log.error(error);
    yield put(updateLabels.failure(error));
  }
}

function* createOneLabel({ payload }) {
  try {

    const {
      name,
      organisationId,
    } = payload;

    if (!(name) || !(organisationId)) throw new Error('Payload is invalid');

    const response = yield call(LabelsService.createLabel, name, organisationId);
    yield put(createLabels.success(response));

  } catch (error) {
    log.error(error);
    yield put(createLabels.failure(error));
  }
}

function* pairLabelsWithObject({ payload }) {
  try {
    const {
      labelId,
      labellableType,
      objectId,
      organisationId
    } = payload;

    const response = yield call(LabelsService.pairLabels, labelId, labellableType, objectId);
    yield put(pairLabelWithObject.success(payload));

    yield put(fetchLabelsOfObjects.request(organisationId, labellableType, objectId));
  } catch (error) {
    log.error(error);
    yield put(pairLabelWithObject.failure(error));
  }
}

function* unPairLabelsWithObject({ payload }) {
  try {
    const {
      labelId,
      labellableType,
      objectId,
      organisationId
    } = payload;

    const response = yield call(LabelsService.unPairLabels, labelId, labellableType, objectId);
    yield put(unPairLabelWithObject.success(payload));
    yield put(fetchLabelsOfObjects.request(organisationId, labellableType, objectId));

  } catch (error) {
    log.error(error);
    yield put(unPairLabelWithObject.failure(error));
  }
}


function* watchFetchLabels() {
  yield* takeLatest(LABELS_FETCH.REQUEST, loadLabels);
}

function* watchUpdateLabels() {
  yield* takeEvery(LABELS_UPDATE.REQUEST, modifyLabels);
}

function* watchCreateLabels() {
  yield* takeEvery(LABELS_CREATE.REQUEST, createOneLabel);
}

function* watchPairLabelWithObject() {
  yield* takeLatest(LABELS_PAIR.REQUEST, pairLabelsWithObject);
}

function* watchUnPairLabelWithObject() {
  yield* takeLatest(LABELS_UNPAIR.REQUEST, unPairLabelsWithObject);
}

function* watchFeatchAttachedLabels() {
  yield* takeEvery(LABELS_OBJECT_FETCH.REQUEST, loadLabelsAttached);
}

export const labelsSagas = [
  fork(watchFetchLabels),
  fork(watchUpdateLabels),
  fork(watchCreateLabels),
  fork(watchPairLabelWithObject),
  fork(watchUnPairLabelWithObject),
  fork(watchFeatchAttachedLabels)
];
