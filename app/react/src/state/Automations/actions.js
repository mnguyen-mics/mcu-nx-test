import { createAction } from 'redux-actions';

import {
  AUTOMATIONS_LIST_FETCH,
  AUTOMATIONS_LIST_TABLE_RESET,
} from '../action-types';

const resetAutomationsTable = createAction(AUTOMATIONS_LIST_TABLE_RESET);

const fetchAutomations = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(AUTOMATIONS_LIST_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(AUTOMATIONS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUTOMATIONS_LIST_FETCH.FAILURE)(error),
};

export {
  fetchAutomations,
  resetAutomationsTable,
};
