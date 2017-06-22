import { createAction } from '../../../utils/ReduxHelper';

import {
  CREATIVES_EMAILS_FETCH,
  CREATIVES_EMAILS_TABLE_RESET
} from '../../action-types';

const resetCreativeEmailsTable = createAction(CREATIVES_EMAILS_TABLE_RESET);

const fetchCreativeEmails = {
  request: (organisationId, filter = {}, isInitialRender = false) => createAction(CREATIVES_EMAILS_FETCH.REQUEST)({ organisationId, filter, isInitialRender }),
  success: (response) => createAction(CREATIVES_EMAILS_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CREATIVES_EMAILS_FETCH.FAILURE)(error)
};

export {
  fetchCreativeEmails,
  resetCreativeEmailsTable
};
