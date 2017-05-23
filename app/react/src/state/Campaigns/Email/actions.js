import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGNS_EMAIL_LIST_FETCH,
  CAMPAIGNS_EMAIL_LOAD_ALL,
  CAMPAIGNS_EMAIL_TABLE_RESET
} from '../../action-types';

<<<<<<< HEAD
const resetCampaignsEmailTable = () => dipatch => {
  return dipatch({
    type: CAMPAIGNS_EMAIL_TABLE_RESET
  });
};

const fetchCampaignsEmail = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    campaignsEmailTable: {
      campaignsEmailApi: {
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
    campaign_type: 'EMAIL',
    first_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
    archived: filter.statuses.includes('ARCHIVED')
  };
=======
const resetCampaignsEmailTable = createAction(CAMPAIGNS_EMAIL_TABLE_RESET);
>>>>>>> 31970ec99ef421bc2d17e0f12cd9c39953a83363

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

const loadCampaignsEmailDataSource = (organisationId, filter) => createAction(CAMPAIGNS_EMAIL_LOAD_ALL)({ organisationId, filter });

export {
  fetchCampaignsEmailList,
  fetchCampaignsEmailDeliveryReport,
  loadCampaignsEmailDataSource,
  resetCampaignsEmailTable
};
