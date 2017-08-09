import { combineReducers } from 'redux';

import {
  // DISPLAY_CAMPAIGNS_DELETE_REQUEST,
  // DISPLAY_CAMPAIGNS_DELETE_REQUEST_FAILURE,
  // DISPLAY_CAMPAIGNS_DELETE_REQUEST_SUCCESS,

  DISPLAY_CAMPAIGNS_LOAD_ALL,
  DISPLAY_CAMPAIGNS_LIST_FETCH,
  DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH,

  DISPLAY_CAMPAIGNS_TABLE_RESET
} from '../../action-types';

const defaultDisplayCampaignsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true,
};

// TODO try to intruce a higher order reducer
// that handle isFetching base on type name (x.REQUEST, x.SUCCESS, ...)

const displayCampaignsApi = (state = defaultDisplayCampaignsApiState, action) => {
  switch (action.type) {
    case DISPLAY_CAMPAIGNS_LOAD_ALL:
    case DISPLAY_CAMPAIGNS_LIST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DISPLAY_CAMPAIGNS_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case DISPLAY_CAMPAIGNS_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case DISPLAY_CAMPAIGNS_TABLE_RESET:
      return defaultDisplayCampaignsApiState;
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
    rows: [],
  },
};
const performanceReportApi = (state = defaultPerformanceReportApiState, action) => {
  switch (action.type) {
    case DISPLAY_CAMPAIGNS_LOAD_ALL:
    case DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data,
      };
    case DISPLAY_CAMPAIGNS_PERFORMANCE_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case DISPLAY_CAMPAIGNS_TABLE_RESET:
      return defaultPerformanceReportApiState;
    default:
      return state;
  }
};

const displayCampaignsTable = combineReducers({
  displayCampaignsApi,
  performanceReportApi,
});

const DisplayCampaignsReducers = { displayCampaignsTable };

export default DisplayCampaignsReducers;
