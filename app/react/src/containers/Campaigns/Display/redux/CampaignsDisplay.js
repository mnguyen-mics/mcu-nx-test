import { CALL_API } from '../../../../middleware/api';

const FETCH_CAMPAIGNS_DISPLAY_REQUEST = 'FETCH_CAMPAIGNS_DISPLAY_REQUEST';
const FETCH_CAMPAIGNS_DISPLAY_SUCCESS = 'FETCH_CAMPAIGNS_DISPLAY_SUCCESS';
const FETCH_CAMPAIGNS_DISPLAY_FAILURE = 'FETCH_CAMPAIGNS_DISPLAY_FAILURE';
const FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_REQUEST = 'FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_REQUEST';
const FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_FAILURE = 'FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_FAILURE';
const FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_SUCCESS = 'FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_SUCCESS';
const SEARCH_CAMPAIGNS_DISPLAY = 'SEARCH_CAMPAIGNS_DISPLAY';
const DELETE_CAMPAIGNS_DISPLAY_REQUEST = 'DELETE_CAMPAIGNS_DISPLAY_REQUEST';
const DELETE_CAMPAIGNS_DISPLAY_FAILURE = 'DELETE_CAMPAIGNS_DISPLAY_FAILURE';
const DELETE_CAMPAIGNS_DISPLAY_SUCCESS = 'DELETE_CAMPAIGNS_DISPLAY_SUCCESS';


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
          types: [FETCH_CAMPAIGNS_DISPLAY_REQUEST, FETCH_CAMPAIGNS_DISPLAY_SUCCESS, FETCH_CAMPAIGNS_DISPLAY_FAILURE]
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
        type: SEARCH_CAMPAIGNS_DISPLAY,
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
          types: [FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_REQUEST, FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_SUCCESS, FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_FAILURE]
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
          types: [DELETE_CAMPAIGNS_DISPLAY_REQUEST, DELETE_CAMPAIGNS_DISPLAY_SUCCESS, DELETE_CAMPAIGNS_DISPLAY_FAILURE]
        }
      });
    }
  };
};

const defaultcampaignsDisplayState = {
  isFetchingCampaignsDisplay: false,
  isFetchingCampaignsDisplayPerformance: false,
  isDeleting: false,
  hasSearched: false,
  campaignsDisplay: [],
  filteredCampaignsDisplay: [],
  campaignsDisplayPerformance: {
    report_view: {
      items_per_page: 0,
      total_items: 0,
      columns_headers: [],
      rows: []
    }
  }
};

const filterCampaignsDisplay = (campaignsDisplay, querySring) => {
  return campaignsDisplay.filter(element => {
    return element.name.toLowerCase().indexOf(querySring.toLowerCase()) > -1;
  });
};

const sortCampaignsDisplay = campaigns => {
  const sortByType = (type, a, b) => {
    return (a[type].toUpperCase() < b[type].toUpperCase()) ? -1 : (a[type].toUpperCase() > b[type].toUpperCase()) ? 1 : 0;
  };
  return [...campaigns]
    .sort((a, b) => sortByType('name', a, b))
    .sort((a, b) => sortByType('status', a, b));
};

const campaignsDisplayState = (state = defaultcampaignsDisplayState, action) => {
  switch (action.type) {
    case FETCH_CAMPAIGNS_DISPLAY_REQUEST:
      return {
        ...state,
        isFetchingCampaignsDisplay: true
      };
    case FETCH_CAMPAIGNS_DISPLAY_SUCCESS:
      return {
        ...state,
        isFetchingCampaignsDisplay: false,
        campaignsDisplay: sortCampaignsDisplay(action.response.data),
        count: action.response.count,
        pagination: {
          skip: action.response.first_results,
          limit: action.response.max_results
        }
      };
    case FETCH_CAMPAIGNS_DISPLAY_FAILURE:
      return {
        ...state,
        isFetchingCampaignsDisplay: false
      };
    case FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_REQUEST:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: true
      };
    case FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_SUCCESS:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: false,
        campaignsDisplayPerformance: action.response.data,
      };
    case FETCH_CAMPAIGNS_DISPLAY_PERFORMANCE_FAILURE:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: false
      };
    case DELETE_CAMPAIGNS_DISPLAY_REQUEST:
      return {
        ...state,
        isDeleting: true
      };
    case DELETE_CAMPAIGNS_DISPLAY_SUCCESS:
      return {
        ...state,
        isDeleting: false,
      };
    case DELETE_CAMPAIGNS_DISPLAY_FAILURE:
      return {
        ...state,
        isDeleting: false
      };
    case SEARCH_CAMPAIGNS_DISPLAY:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: false,
        hasSearched: action.data.querySring ? true : false,
        filteredCampaignsDisplay: filterCampaignsDisplay(state.campaignsDisplay, action.data.querySring),
      };
    default:
      return state;
  }

};

export {
  fetchCampaignsDisplay,
  fetchCampaignsDisplayPerformance,
  campaignsDisplayState,
  searchCampaignsDisplay,
  deleteCampaignsDisplay
};
