import { combineReducers } from 'redux';
import {
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST,
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  GOALS_FETCH_REQUEST,
  GOALS_FETCH_REQUEST_FAILURE,
  GOALS_FETCH_REQUEST_SUCCESS,

  GOALS_TABLE_RESET
} from '../../action-types';

const defaultGoalsApiState = {
  isFetching: false,
  hasFetched: false,
  data: [],
  total: 0
};
const goalsApi = (state = defaultGoalsApiState, action) => {
  switch (action.type) {
    case GOALS_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case GOALS_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        hasFetched: true,
        ...action.response
      };
    case GOALS_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case GOALS_TABLE_RESET:
      return defaultGoalsApiState;
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
    case GOALS_PERFORMANCE_REPORT_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.response.data
      };
    case GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case GOALS_TABLE_RESET:
      return defaultPerformanceReportApiState;
    default:
      return state;
  }
};

const goalsTable = combineReducers({
  goalsApi,
  performanceReportApi
});

const GoalsReducers = { goalsTable };

export default GoalsReducers;
