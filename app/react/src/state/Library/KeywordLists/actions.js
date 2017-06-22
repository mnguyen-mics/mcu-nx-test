import { createAction } from '../../../utils/ReduxHelper';

import {
  KEYWORD_LISTS_FETCH,
  KEYWORD_LISTS_TABLE_RESET
} from '../../action-types';

const resetKeywordListsTable = createAction(KEYWORD_LISTS_TABLE_RESET);

const fetchKeywordLists = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(KEYWORD_LISTS_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(KEYWORD_LISTS_FETCH.SUCCESS)(response),
  failure: (error) => createAction(KEYWORD_LISTS_FETCH.FAILURE)(error)
};

export {
  fetchKeywordLists,
  resetKeywordListsTable
};
