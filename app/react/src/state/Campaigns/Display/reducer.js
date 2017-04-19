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

    case CAMPAIGNS_DISPLAY_FETCH_REQUEST:
      return {
        ...state,
        isFetchingCampaignsDisplay: true
      };
    case CAMPAIGNS_DISPLAY_FETCH_REQUEST_SUCCESS:
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
    case CAMPAIGNS_DISPLAY_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetchingCampaignsDisplay: false
      };

    case CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: true
      };
    case CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: false,
        campaignsDisplayPerformance: action.response.data,
      };
    case CAMPAIGNS_DISPLAY_PERFORMANCE_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetchingCampaignsDisplayPerformance: false
      };

    case CAMPAIGNS_DISPLAY_DELETE_REQUEST:
      return {
        ...state,
        isDeleting: true
      };
    case CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS:
      return {
        ...state,
        isDeleting: false,
      };
    case CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE:
      return {
        ...state,
        isDeleting: false
      };
    case CAMPAIGNS_DISPLAY_SEARCH:
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

const CampaignsDisplayReducers = {
  campaignsDisplayState
};

export default CampaignsDisplayReducers;
