import { call, fork, put, all, takeLatest } from 'redux-saga/effects';

import log from '../../../utils/Logger';

import { fetchAudiencePartitionsList } from './actions';

import AudiencePartitionsService from '../../../services/AudiencePartitionsService';

import { getPaginatedApiParam } from '../../../utils/ApiHelper.ts';

import { AUDIENCE_PARTITIONS_LIST_FETCH } from '../../action-types';

function* loadAudiencePartitionsList({ payload }) {
  try {
    const { organisationId, filter, isInitialRender } = payload;

    if (!(organisationId || filter)) throw new Error('Payload is invalid');

    const options = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.keywords) {
      options.name = filter.keywords;
    }
    if (filter.types) {
      options.types = filter.types;
    }

    if (filter.datamartId) {
      options.datamart_id = filter.datamartId;
    }

    const initialOptions = {
      ...getPaginatedApiParam(1, 1),
    };

    let allCalls;

    if (isInitialRender) {
      allCalls = {
        initialFetch: call(
          AudiencePartitionsService.getPartitions,
          organisationId,
          initialOptions,
        ),
        response: call(
          AudiencePartitionsService.getPartitions,
          organisationId,
          options,
        ),
      };
    } else {
      allCalls = {
        response: call(
          AudiencePartitionsService.getPartitions,
          organisationId,
          options,
        ),
      };
    }

    const { initialFetch, response } = yield all(allCalls);

    if (initialFetch) {
      response.hasItems = initialFetch.count > 0;
    }

    yield put(fetchAudiencePartitionsList.success(response));
  } catch (error) {
    log.error(error);
    yield put(fetchAudiencePartitionsList.failure(error));
  }
}

function* watchFetchAudiencePartitionsList() {
  yield takeLatest(
    AUDIENCE_PARTITIONS_LIST_FETCH.REQUEST,
    loadAudiencePartitionsList,
  );
}

export const partitionsSagas = [fork(watchFetchAudiencePartitionsList)];
