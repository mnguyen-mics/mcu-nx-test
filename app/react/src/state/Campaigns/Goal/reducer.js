import { combineReducers } from 'redux';
import {
  GOALS_FETCH,
  GOALS_LOAD_ALL,
  GOALS_PERFORMANCE_REPORT_FETCH,
  GOALS_TABLE_RESET,
} from '../../action-types';

const defaultGoalsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: 0
};
const goalsApi = (state = defaultGoalsApiState, action) => {
  switch (action.type) {
    case GOALS_LOAD_ALL:
    case GOALS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case GOALS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case GOALS_FETCH.FAILURE:
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
    case GOALS_LOAD_ALL:
    case GOALS_PERFORMANCE_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case GOALS_PERFORMANCE_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data
      };
    case GOALS_PERFORMANCE_REPORT_FETCH.FAILURE:
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
