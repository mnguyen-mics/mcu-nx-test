import { CALL_API } from '../../../middleware/api';

const FETCH_CAMPAIGNS_REQUEST = 'FETCH_CAMPAIGNS_REQUEST';
const FETCH_CAMPAIGNS_SUCCESS = 'FETCH_CAMPAIGNS_SUCCESS';
const FETCH_CAMPAIGNS_FAILURE = 'FETCH_CAMPAIGNS_FAILURE';
const FETCH_CAMPAIGNS_PERFORMANCE_REQUEST = 'FETCH_CAMPAIGNS_PERFORMANCE_REQUEST';
const FETCH_CAMPAIGNS_PERFORMANCE_FAILURE = 'FETCH_CAMPAIGNS_PERFORMANCE_FAILURE';
const FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS = 'FETCH_CAMPAIGNS_PERFORMANCE_SUCCESS';
const SEARCH_CAMPAIGNS = 'SEARCH_CAMPAIGNS';
const DELETE_CAMPAIGNS_PERFORMANCE_REQUEST = 'DELETE_CAMPAIGNS_PERFORMANCE_REQUEST';
const DELETE_CAMPAIGNS_PERFORMANCE_FAILURE = 'DELETE_CAMPAIGNS_PERFORMANCE_FAILURE';
const DELETE_CAMPAIGNS_PERFORMANCE_SUCCESS = 'DELETE_CAMPAIGNS_PERFORMANCE_SUCCESS';


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

const searchCampaigns = (queryString) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsState } = getState();

    if (!campaignsState.isFetching) {
      const filteredCampaigns = [];
      campaignsState.campaigns.map((element) => {
        if (element.name.toLowerCase().indexOf(queryString.toLowerCase()) > -1) {
          return filteredCampaigns.push(element);
        }
        return null;
      });
      console.log(filteredCampaigns);
      return dispatch({
        type: SEARCH_CAMPAIGNS,
        data: {
          querySring: queryString,
          filteredCampaign: filteredCampaigns
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

const deleteCampaigns = (id) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignsState } = getState();

    if (!campaignsState.isDeleting) {
      return dispatch({
        [CALL_API]: {
          method: 'delete',
          endpoint: `display_campaigns/${id}`,
          authenticated: true,
          types: [DELETE_CAMPAIGNS_PERFORMANCE_REQUEST, DELETE_CAMPAIGNS_PERFORMANCE_SUCCESS, DELETE_CAMPAIGNS_PERFORMANCE_FAILURE]
        }
      });
    }
  };
};

const defaultcampaignsState = {
  isFetching: false,
  isFetchingCampaignsPerformance: false,
  isDeleting: false,
  hasSearched: false,
  campaigns: [],
  filteredCampaigns: [],
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
    case DELETE_CAMPAIGNS_PERFORMANCE_REQUEST:
      return {
        ...state,
        isDeleting: true
      };
    case DELETE_CAMPAIGNS_PERFORMANCE_SUCCESS:
      return {
        ...state,
        isDeleting: false,
      };
    case DELETE_CAMPAIGNS_PERFORMANCE_FAILURE:
      return {
        ...state,
        isDeleting: false
      };
    case SEARCH_CAMPAIGNS:
      return {
        ...state,
        isFetchingCampaignsPerformance: false,
        hasSearched: action.data.querySring ? true : false,
        filteredCampaigns: action.data.filteredCampaign,
      };
    default:
      return state;
  }

};

export {
  fetchCampaigns,
  fetchCampaignsPerformance,
  campaignsState,
  searchCampaigns,
  deleteCampaigns
};
