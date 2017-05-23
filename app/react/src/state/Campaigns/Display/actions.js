import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGNS_DISPLAY_LOAD_ALL,
  CAMPAIGNS_DISPLAY_LIST_FETCH,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH,
  CAMPAIGNS_DISPLAY_TABLE_RESET
} from '../../action-types';

<<<<<<< HEAD
const resetCampaignsDisplayTable = () => ({
  type: CAMPAIGNS_DISPLAY_TABLE_RESET
});

const fetchCampaignsDisplay = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    campaignsDisplayTable: {
      campaignsDisplayApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  /*
  if (isFetching) {
    return Promise.resolve();
  }
  */

  const params = {
    organisation_id: organisationId,
    campaign_type: 'DISPLAY',
    first_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
    archived: filter.statuses.includes('ARCHIVED')
  };

  const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

  if (filter.keywords) { params.keywords = filter.keywords; }
  if (apiStatuses.length > 0) {
    params.status = apiStatuses;
  }
=======
const resetCampaignsDisplayTable = createAction(CAMPAIGNS_DISPLAY_TABLE_RESET);
>>>>>>> 31970ec99ef421bc2d17e0f12cd9c39953a83363

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
