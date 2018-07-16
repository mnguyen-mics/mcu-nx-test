import { createAction } from 'redux-actions';

import {
  EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH,
  EMAIL_CAMPAIGNS_LIST_FETCH,
  EMAIL_CAMPAIGNS_LOAD_ALL,
  EMAIL_CAMPAIGNS_TABLE_RESET,
} from '../../action-types';

const resetEmailCampaignsTable = createAction(EMAIL_CAMPAIGNS_TABLE_RESET);

const fetchEmailCampaignsList = {
  request: (organisationId, filter = {}) => createAction(EMAIL_CAMPAIGNS_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(EMAIL_CAMPAIGNS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(EMAIL_CAMPAIGNS_LIST_FETCH.FAILURE)(error),
};

const fetchEmailCampaignsDeliveryReport = {
  request: (organisationId, filter = {}) => createAction(EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.FAILURE)(error),
};

const loadEmailCampaignsDataSource = (organisationId, filter, isInitialRender = false) => createAction(EMAIL_CAMPAIGNS_LOAD_ALL)({ organisationId, filter, isInitialRender });

export {
  fetchEmailCampaignsList,
  fetchEmailCampaignsDeliveryReport,
  loadEmailCampaignsDataSource,
  resetEmailCampaignsTable,
};
