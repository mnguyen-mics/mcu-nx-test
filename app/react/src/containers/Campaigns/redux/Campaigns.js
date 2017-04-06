import { CALL_API } from '../../../middleware/api';

const FETCH_CAMPAIGNS_REQUEST = 'FETCH_CAMPAIGNS_REQUEST';
const FETCH_CAMPAIGNS_SUCCESS = 'FETCH_CAMPAIGNS_SUCCESS';
const FETCH_CAMPAIGNS_FAILURE = 'FETCH_CAMPAIGNS_FAILURE';
const FETCH_CAMPAIGNS_PERFORMANCE_REQUEST = 'FETCH_CAMPAIGNS_PERFORMANCE_REQUEST';
const FETCH_CAMPAIGNS_PERFORMANCE_FAILURE = 'FETCH_CAMPAIGNS_PERFORMANCE_FAILURE';
const FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS = 'FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS';

const fetchCampaigns = (params) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsState } = getState();

    if (!campaignsState.isFetching) {
      return dispatch({
        [CALL_API]: {
          method: 'get',
          endpoint: 'display_campaigns',
          params,
          authenticated: true,
          types: [FETCH_CAMPAIGNS_REQUEST, FETCH_CAMPAIGNS_SUCCESS, FETCH_CAMPAIGNS_FAILURE]
        }
      });
    }
  };
};

const fetchCampaignsPerformance = (params) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsState } = getState();

    if (!campaignsState.isFetchingCampaignsPerformance) {
      return dispatch({
        [CALL_API]: {
          method: 'get',
          endpoint: 'reports/display_campaign_performance_report',
          params,
          authenticated: true,
          types: [FETCH_CAMPAIGNS_PERFORMANCE_REQUEST, FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS, FETCH_CAMPAIGNS_PERFORMANCE_FAILURE]
        }
      });
    }
  };
};

const defaultcampaignsState = {
  isFetching: false,
  isFetchingCampaignsPerformance: false,
  campaigns: [],
  campaignsPerformance: {
    report_view: {
      items_per_page: 0,
      total_items: 0,
      columns_headers: [],
      rows: []
    }
  }
};

const campaignsState = (state = defaultcampaignsState, action) => {

  switch (action.type) {
    case FETCH_CAMPAIGNS_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case FETCH_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        campaigns: action.response.data,
        count: action.response.count,
        pagination: {
          skip: action.response.first_result,
          limit: action.response.max_result
        }
      };
    case FETCH_CAMPAIGNS_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case FETCH_CAMPAIGNS_PERFORMANCE_REQUEST:
      return {
        ...state,
        isFetchingCampaignsPerformance: true
      };
    case FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS:
      return {
        ...state,
        isFetchingCampaignsPerformance: false,
        campaignsPerformance: action.response.data,
      };
    case FETCH_CAMPAIGNS_PERFORMANCE_FAILURE:
      return {
        ...state,
        isFetchingCampaignsPerformance: false
      };
    default:
      return state;
  }

};

export {
  fetchCampaigns,
  fetchCampaignsPerformance,
  campaignsState
};
