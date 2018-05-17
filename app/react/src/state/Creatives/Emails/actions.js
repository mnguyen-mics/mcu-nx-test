import { createAction } from 'redux-actions';

import { CREATIVES_EMAIL_FETCH, CREATIVES_EMAIL_RESET } from '../../action-types';

const resetCreativeEmails = createAction(CREATIVES_EMAIL_RESET);

const fetchCreativeEmails = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(CREATIVES_EMAIL_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(CREATIVES_EMAIL_FETCH.SUCCESS)(response),
  failure: createAction(CREATIVES_EMAIL_FETCH.FAILURE),
};

export { fetchCreativeEmails, resetCreativeEmails };
