import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGNS_DISPLAY_LOAD_ALL,
  CAMPAIGNS_DISPLAY_LIST_FETCH,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH,
  CAMPAIGNS_DISPLAY_TABLE_RESET
} from '../../action-types';

const resetCampaignsDisplayTable = createAction(CAMPAIGNS_DISPLAY_TABLE_RESET);

const fetchCampaignsDisplayList = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_DISPLAY_LIST_FETCH.FAILURE)(error)
};

const fetchCampaignsDisplayPerformanceReport = {
  request: (organisationId, filter = {}) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.FAILURE)(error)
};

const loadCampaignsDisplayDataSource = (organisationId, filter) => createAction(CAMPAIGNS_DISPLAY_LOAD_ALL)({ organisationId, filter });


export {
  fetchCampaignsDisplayList,
  fetchCampaignsDisplayPerformanceReport,
  loadCampaignsDisplayDataSource,
  resetCampaignsDisplayTable
};
