import { createAction } from '../../utils/ReduxHelper';

import {
  AUTOMATIONS_LIST_FETCH,
  AUTOMATIONS_LIST_TABLE_RESET
} from '../action-types';

const resetAutomationsTable = createAction(AUTOMATIONS_LIST_TABLE_RESET);

const fetchAutomations = {
  request: (organisationId, filter = {}) => createAction(AUTOMATIONS_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(AUTOMATIONS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUTOMATIONS_LIST_FETCH.FAILURE)(error)
};

export {
  fetchAutomations,
  resetAutomationsTable
};
