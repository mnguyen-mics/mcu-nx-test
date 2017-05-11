import { CALL_API } from '../../../middleware/api';

import {
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST,
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
  GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  GOALS_FETCH_REQUEST,
  GOALS_FETCH_REQUEST_FAILURE,
  GOALS_FETCH_REQUEST_SUCCESS,

  GOALS_TABLE_RESET
} from '../../action-types';

const resetGoalsTable = () => ({
  type: GOALS_TABLE_RESET
});

const fetchGoals = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    goalsTable: {
      goalsApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  if (isFetching) {
    return Promise.resolve();
  }

  const params = {
    organisation_id: organisationId,
    fist_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
    archived: filter.statuses.includes('ARCHIVED')
  };

  if (filter.keywords) { params.keywords = filter.keywords; }

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'goals',
      params,
      authenticated: true,
      types: [GOALS_FETCH_REQUEST, GOALS_FETCH_REQUEST_FAILURE, GOALS_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchGoalsPerformanceReport = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    goalsTable: {
      performanceReportApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  const DATE_FORMAT = 'YYYY-MM-DD';

  if (isFetching) {
    return Promise.resolve();
  }

  const params = {
    organisation_id: organisationId,
    start_date: filter.from.format(DATE_FORMAT),
    end_date: filter.to.format(DATE_FORMAT),
    // dimension: '',
    dimension: 'goal_id',
    // filters: `organisation_id==${organisationId}`,
    // filters: `goal_id==${(filter.goalIds || []).join(',')}`,
    metrics: ['conversions', 'value']
  };

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'reports/conversion_performance_report',
      params,
      authenticated: true,
      types: [GOALS_PERFORMANCE_REPORT_FETCH_REQUEST, GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE, GOALS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchGoalsAndStatistics = filter => dispatch => {
  // return dispatch(fetchGoals(filter));
  return Promise.all([
    dispatch(fetchGoals(filter)),
    dispatch(fetchGoalsPerformanceReport(filter))
  ]);
};

export {
  fetchGoals,
  fetchGoalsPerformanceReport,
  fetchGoalsAndStatistics,
  resetGoalsTable
};
