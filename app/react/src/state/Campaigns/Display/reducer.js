import { combineReducers } from 'redux';

import {
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST,
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE,
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS,

  CAMPAIGNS_DISPLAY_LOAD_ALL,
  CAMPAIGNS_DISPLAY_LIST_FETCH,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH,

  CAMPAIGNS_DISPLAY_TABLE_RESET
} from '../../action-types';

const defaultCampaignsDisplayApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const campaignsDisplayApi = (state = defaultCampaignsDisplayApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_DISPLAY_LOAD_ALL:
    case CAMPAIGNS_DISPLAY_LIST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGNS_DISPLAY_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case CAMPAIGNS_DISPLAY_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CAMPAIGNS_DISPLAY_TABLE_RESET:
      return defaultCampaignsDisplayApiState;
    default:
      return state;
  }
};

const defaultPerformanceReportApiState = {
  isFetching: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};
const performanceReportApi = (state = defaultPerformanceReportApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_DISPLAY_LOAD_ALL:
    case CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data
      };
    case CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CAMPAIGNS_DISPLAY_TABLE_RESET:
      return defaultPerformanceReportApiState;
    default:
      return state;
  }
};

const campaignsDisplayTable = combineReducers({
  campaignsDisplayApi,
  performanceReportApi
});

const CampaignsDisplayReducers = { campaignsDisplayTable };

export default CampaignsDisplayReducers;
