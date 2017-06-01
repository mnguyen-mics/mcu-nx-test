import { takeLatest } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchAssetsFiles
} from './actions';

import AssetsFilesService from '../../../services/Library/AssetsFilesService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper';

import {
    ASSETS_FILES_FETCH
} from '../../action-types';

function* loadAssetsFiles({ payload }) {
  try {

    const {
      organisationId,
      filter
    } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
    };

    const response = yield call(AssetsFilesService.getAssetsFiles, organisationId, options);
    yield put(fetchAssetsFiles.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAssetsFiles.failure(error));
  }
}

function* watchfetchAssetsFiles() {
  yield* takeLatest(ASSETS_FILES_FETCH.REQUEST, loadAssetsFiles);
}

export const assetsFilesSagas = [
  fork(watchfetchAssetsFiles)
];
