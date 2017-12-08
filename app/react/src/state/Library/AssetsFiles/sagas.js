import { takeLatest } from 'redux-saga';
import { call, fork, put, all } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import {
    fetchAssetsFiles,
} from './actions';

import AssetsFilesService from '../../../services/Library/AssetsFilesService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import {
    ASSETS_FILES_FETCH,
} from '../../action-types';

function* loadAssetsFiles({ payload }) {
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
        initialFetch: call(AssetsFilesService.getAssetsFiles, organisationId, initialOptions),
        response: call(AssetsFilesService.getAssetsFiles, organisationId, options),
      };
    } else {
      allCalls = {
        response: call(AssetsFilesService.getAssetsFiles, organisationId, options),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

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
  fork(watchfetchAssetsFiles),
];
