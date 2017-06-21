import { createAction } from '../../../utils/ReduxHelper';

import {
  CREATIVES_DISPLAY_FETCH,
  CREATIVES_DISPLAY_TABLE_RESET
} from '../../action-types';

const resetCreativeDisplayTable = createAction(CREATIVES_DISPLAY_TABLE_RESET);

const fetchCreativeDisplay = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(CREATIVES_DISPLAY_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(CREATIVES_DISPLAY_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CREATIVES_DISPLAY_FETCH.FAILURE)(error)
};

export {
  fetchCreativeDisplay,
  resetCreativeDisplayTable
};
