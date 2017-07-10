import { createAction } from '../../../utils/ReduxHelper';

import {
  PLACEMENT_LISTS_FETCH,
  PLACEMENT_LISTS_TABLE_RESET
} from '../../action-types';

const resetPlacementListsTable = createAction(PLACEMENT_LISTS_TABLE_RESET);

const fetchPlacementLists = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(PLACEMENT_LISTS_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(PLACEMENT_LISTS_FETCH.SUCCESS)(response),
  failure: (error) => createAction(PLACEMENT_LISTS_FETCH.FAILURE)(error)
};

export {
  fetchPlacementLists,
  resetPlacementListsTable
};
