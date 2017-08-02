import { combineReducers } from 'redux';

import {
  // AUDIENCE_SEGMENTS_DELETE_REQUEST,
  // AUDIENCE_SEGMENTS_DELETE_REQUEST_FAILURE,
  // AUDIENCE_SEGMENTS_DELETE_REQUEST_SUCCESS,

  AUDIENCE_SEGMENTS_LOAD_ALL,
  AUDIENCE_SEGMENTS_LIST_FETCH,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENTS_TABLE_RESET,
  AUDIENCE_SEGMENT_SINGLE_LOAD_ALL,
  AUDIENCE_SEGMENT_SINGLE_FETCH,
  AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENT_SINGLE_RESET,
  AUDIENCE_SEGMENT_RETRIEVE_OVERLAP
} from '../../action-types';

const defaultAudienceSegmentsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true
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

const defaultAudienceSegmentSingleApiState = {
  audienceSegment: {},
  isFetching: false,
  isUpdating: false,
  isArchiving: false
};

const audienceSegmentsSingleApi = (state = defaultAudienceSegmentSingleApiState, action) => {
  switch (action.type) {
    case AUDIENCE_SEGMENT_SINGLE_LOAD_ALL:
    case AUDIENCE_SEGMENT_SINGLE_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_SEGMENT_SINGLE_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        audienceSegment: action.payload,
      };
    case AUDIENCE_SEGMENT_SINGLE_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_SEGMENT_SINGLE_RESET:
      return defaultAudienceSegmentSingleApiState;
    default:
      return state;
  }
};

const defaultPerformanceReportSingleApiState = {
  isFetching: false,
  hasFetched: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};
const performanceReportSingleApi = (state = defaultPerformanceReportSingleApiState, action) => {
  switch (action.type) {
    case AUDIENCE_SEGMENT_SINGLE_LOAD_ALL:
    case AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        hasFetched: true,
        ...action.payload.data
      };
    case AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_SEGMENT_SINGLE_RESET:
      return defaultPerformanceReportSingleApiState;
    default:
      return state;
  }
};

const defaultOverlapAnalysisApiState = {
  isFetching: false,
  hasOverlap: true,
  data: {
    date: 0,
    segments: [],
    overlaps: []
  }
};

const overlapAnalysisApi = (state = defaultOverlapAnalysisApiState, action) => {
  switch (action.type) {
    case AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.SUCCESS:
      return {
        ...state,
        isFetching: false,
        hasOverlap: action.payload.hasOverlap,
        data: action.payload
      };
    case AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_SEGMENT_SINGLE_RESET:
      return defaultOverlapAnalysisApiState;
    default:
      return state;
  }
};


const audienceSegmentsTable = combineReducers({
  audienceSegmentsApi,
  performanceReportApi,
  performanceReportSingleApi,
  audienceSegmentsSingleApi,
  overlapAnalysisApi
});

const AudienceSegmentsReducers = { audienceSegmentsTable };

export default AudienceSegmentsReducers;
