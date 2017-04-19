import { CALL_API } from '../../../middleware/api';

import {
  CAMPAIGNS_DISPLAY_DELETE_REQUEST,
  CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE,
  CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS,
  CAMPAIGNS_DISPLAY_FETCH_REQUEST,
  CAMPAIGNS_DISPLAY_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_DISPLAY_FETCH_REQUEST_SUCCESS,
  CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST,
  CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_SUCCESS,
  CAMPAIGNS_DISPLAY_SEARCH
} from '../../action-types';

const fetchCampaignsDisplay = (params) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsDisplayState } = getState();

    if (!campaignsDisplayState.isFetchingCampaignsDisplay) {
      return dispatch({
        [CALL_API]: {
          method: 'get',
          endpoint: 'display_campaigns',
          params,
          authenticated: true,
          types: [CAMPAIGNS_DISPLAY_FETCH_REQUEST, CAMPAIGNS_DISPLAY_FETCH_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_FETCH_REQUEST_SUCCESS]
        }
      });
    }
  };
};

const searchCampaignsDisplay = (queryString) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsDisplayState } = getState();

    if (!campaignsDisplayState.isFetchingCampaignsDisplay) {
      return dispatch({
        type: CAMPAIGNS_DISPLAY_SEARCH,
        data: {
          querySring: queryString,
        }
      });
    }
  };
};

const fetchCampaignsDisplayPerformance = (params) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsDisplayState } = getState();

    if (!campaignsDisplayState.isFetchingCampaignsDisplayPerformance) {
      return dispatch({
        [CALL_API]: {
          method: 'get',
          endpoint: 'reports/display_campaign_performance_report',
          params,
          authenticated: true,
          types: [CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST, CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_SUCCESS]
        }
      });
    }
  };
};

const deleteCampaignsDisplay = (id) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsDisplayState } = getState();

    if (!campaignsDisplayState.isDeleting) {
      return dispatch({
        [CALL_API]: {
          method: 'delete',
          endpoint: `display_campaigns/${id}`,
          authenticated: true,
          types: [CAMPAIGNS_DISPLAY_DELETE_REQUEST, CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS]
        }
      });
    }
  };
};

export {
  fetchCampaignsDisplay,
  fetchCampaignsDisplayPerformance,
  searchCampaignsDisplay,
  deleteCampaignsDisplay
};
