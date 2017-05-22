import { combineReducers } from 'redux';

import {
  // AUDIENCE_SEGMENTS_DELETE_REQUEST,
  // AUDIENCE_SEGMENTS_DELETE_REQUEST_FAILURE,
  // AUDIENCE_SEGMENTS_DELETE_REQUEST_SUCCESS,

  AUDIENCE_SEGMENTS_LOAD_ALL,
  AUDIENCE_SEGMENTS_LIST_FETCH,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENTS_TABLE_RESET
} from '../../action-types';

const defaultAudienceSegmentsApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const audienceSegmentsApi = (state = defaultAudienceSegmentsApiState, action) => {
  switch (action.type) {
    case AUDIENCE_SEGMENTS_LOAD_ALL:
    case AUDIENCE_SEGMENTS_LIST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_SEGMENTS_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case AUDIENCE_SEGMENTS_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_SEGMENTS_TABLE_RESET:
      return defaultAudienceSegmentsApiState;
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
    case AUDIENCE_SEGMENTS_LOAD_ALL:
    case AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data
      };
    case AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_SEGMENTS_TABLE_RESET:
      return defaultPerformanceReportApiState;
    default:
      return state;
  }
};


const audienceSegmentsTable = combineReducers({
  audienceSegmentsApi,
  performanceReportApi
});

const AudienceSegmentsReducers = { audienceSegmentsTable };

export default AudienceSegmentsReducers;
