import { createAction } from 'redux-actions';

import { CREATIVES_NATIVE_FETCH, CREATIVES_NATIVE_RESET } from '../../action-types';

const resetNativeCreatives = createAction(CREATIVES_NATIVE_RESET);

const fetchNativeCreatives = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(CREATIVES_NATIVE_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(CREATIVES_NATIVE_FETCH.SUCCESS)(response),
  failure: createAction(CREATIVES_NATIVE_FETCH.FAILURE),
};

export { resetNativeCreatives, fetchNativeCreatives };
