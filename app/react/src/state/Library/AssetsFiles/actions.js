import { createAction } from 'redux-actions';

import { ASSETS_FILES_FETCH, ASSETS_FILES_RESET } from '../../action-types';

const resetAssetsFiles = createAction(ASSETS_FILES_RESET);

const fetchAssetsFiles = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(ASSETS_FILES_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(ASSETS_FILES_FETCH.SUCCESS)(response),
  failure: (error) => createAction(ASSETS_FILES_FETCH.FAILURE)(error),
};

export { fetchAssetsFiles, resetAssetsFiles };
