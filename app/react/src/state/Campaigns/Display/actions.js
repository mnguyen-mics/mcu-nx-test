import { createAction } from 'redux-actions';

import {
  DISPLAY_CAMPAIGNS_LOAD_ALL,
  DISPLAY_CAMPAIGNS_LIST_FETCH,
  DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH,
  DISPLAY_CAMPAIGNS_TABLE_RESET
} from '../../action-types';

const resetDisplayCampaignsTable = createAction(DISPLAY_CAMPAIGNS_TABLE_RESET);

const fetchDisplayCampaignsList = {
  request: (organisationId, filter = {}) => createAction(DISPLAY_CAMPAIGNS_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(DISPLAY_CAMPAIGNS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(DISPLAY_CAMPAIGNS_LIST_FETCH.FAILURE)(error),
};

const fetchDisplayCampaignsPerformanceReport = {
  request: (organisationId, filter = {}) => createAction(DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.FAILURE)(error),
};

const loadDisplayCampaignsDataSource = (organisationId, filter, isInitialRender = false) => createAction(DISPLAY_CAMPAIGNS_LOAD_ALL)({ organisationId, filter, isInitialRender });


export {
  fetchDisplayCampaignsList,
  fetchDisplayCampaignsPerformanceReport,
  loadDisplayCampaignsDataSource,
  resetDisplayCampaignsTable
};
