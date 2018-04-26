import { createAction } from 'redux-actions';

import {
  AUDIENCE_PARTITIONS_LIST_FETCH,
  AUDIENCE_PARTITIONS_TABLE_RESET,
} from '../../action-types';

const resetAudiencePartitionsTable = createAction(AUDIENCE_PARTITIONS_TABLE_RESET);

const fetchAudiencePartitionsList = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(AUDIENCE_PARTITIONS_LIST_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(AUDIENCE_PARTITIONS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_PARTITIONS_LIST_FETCH.FAILURE)(error),
};

export {
  fetchAudiencePartitionsList,
  resetAudiencePartitionsTable,
};
