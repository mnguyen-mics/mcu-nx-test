import { combineReducers } from 'redux';

import {
  // AUTOMATIONS_LIST_DELETE_REQUEST,
  // AUTOMATIONS_LIST_DELETE_REQUEST_FAILURE,
  // AUTOMATIONS_LIST_DELETE_REQUEST_SUCCESS,

  AUTOMATIONS_LIST_FETCH_REQUEST,
  AUTOMATIONS_LIST_FETCH_REQUEST_FAILURE,
  AUTOMATIONS_LIST_FETCH_REQUEST_SUCCESS,

//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST,
//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  AUTOMATIONS_LIST_TABLE_RESET
} from '../action-types';

const defaultAutomationsApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const automationsApi = (state = defaultAutomationsApiState, action) => {
  switch (action.type) {

    case AUTOMATIONS_LIST_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUTOMATIONS_LIST_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.response
      };
    case AUTOMATIONS_LIST_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUTOMATIONS_LIST_TABLE_RESET:
      return defaultAutomationsApiState;
    default:
      return state;
  }
};

// const defaultPerformanceReportApiState = {
//   isFetching: false,
//   report_view: {
//     items_per_page: 0,
//     total_items: 0,
//     columns_headers: [],
//     rows: []
//   }
// };
// const performanceReportApi = (state = defaultPerformanceReportApiState, action) => {
//   switch (action.type) {
//     case AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST:
//       return {
//         ...state,
//         isFetching: true
//       };
//     case AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS:
//       return {
//         ...state,
//         isFetching: false,
//         ...action.response.data
//       };
//     case AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE:
//       return {
//         ...state,
//         isFetching: false
//       };
//     case AUTOMATIONS_LIST_TABLE_RESET:
//       return defaultPerformanceReportApiState;
//     default:
//       return state;
//   }
// };


const automationsTable = combineReducers({
  automationsApi,
//  performanceReportApi
});

const AutomationsReducers = { automationsTable };

export default AutomationsReducers;
