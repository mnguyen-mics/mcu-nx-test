import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGNS_EMAIL_LIST_FETCH,
  CAMPAIGNS_EMAIL_LOAD_ALL,
  CAMPAIGNS_EMAIL_TABLE_RESET
} from '../../action-types';

const resetCampaignsEmailTable = createAction(CAMPAIGNS_EMAIL_TABLE_RESET);

const fetchCampaignsEmailList = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_EMAIL_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_EMAIL_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_EMAIL_LIST_FETCH.FAILURE)(error)
};

const fetchCampaignsEmailDeliveryReport = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.FAILURE)(error)
};

const loadCampaignsEmailDataSource = (organisationId, filter, isInitialRender = false) => createAction(CAMPAIGNS_EMAIL_LOAD_ALL)({ organisationId, filter, isInitialRender });

export {
  fetchCampaignsEmailList,
  fetchCampaignsEmailDeliveryReport,
  loadCampaignsEmailDataSource,
  resetCampaignsEmailTable
};
