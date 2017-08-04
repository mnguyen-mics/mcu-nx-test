import { createAction } from 'redux-actions';

import {
  CAMPAIGNS_DISPLAY_LOAD_ALL,
  CAMPAIGNS_DISPLAY_LIST_FETCH,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH,
  CAMPAIGNS_DISPLAY_TABLE_RESET,
} from '../../action-types';

const resetDisplayCampaignsTable = createAction(CAMPAIGNS_DISPLAY_TABLE_RESET);

const fetchDisplayCampaignsList = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.FAILURE)(error),
};

const fetchDisplayCampaignsPerformanceReport = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.FAILURE)(error),
};

const loadDisplayCampaignsDataSource = (organisationId, filter, isInitialRender = false) => createAction(CAMPAIGNS_DISPLAY_LOAD_ALL)({ organisationId, filter, isInitialRender });


export {
  fetchDisplayCampaignsList,
  fetchDisplayCampaignsPerformanceReport,
  loadDisplayCampaignsDataSource,
  resetDisplayCampaignsTable
};
