import { createAction } from '../../../utils/ReduxHelper';

import {
  ASSETS_FILES_FETCH,
  ASSETS_FILES_TABLE_RESET
} from '../../action-types';

const resetAssetsFilesTable = createAction(ASSETS_FILES_TABLE_RESET);

const fetchAssetsFiles = {
  request: (organisationId, filter = {}) => createAction(ASSETS_FILES_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(ASSETS_FILES_FETCH.SUCCESS)(response),
  failure: (error) => createAction(ASSETS_FILES_FETCH.FAILURE)(error)
};

export {
  fetchAssetsFiles,
  resetAssetsFilesTable
};
