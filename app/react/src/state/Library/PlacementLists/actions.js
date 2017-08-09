import { createAction } from 'redux-actions';

import { PLACEMENT_LISTS_FETCH, PLACEMENT_LISTS_RESET } from '../../action-types';

const resetPlacementLists = createAction(PLACEMENT_LISTS_RESET);

const fetchPlacementLists = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(PLACEMENT_LISTS_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(PLACEMENT_LISTS_FETCH.SUCCESS)(response),
  failure: (error) => createAction(PLACEMENT_LISTS_FETCH.FAILURE)(error),
};

export { fetchPlacementLists, resetPlacementLists };
