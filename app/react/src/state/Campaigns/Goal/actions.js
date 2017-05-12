import { createAction } from '../../../utils/ReduxHelper';

import {
  GOALS_FETCH,
  GOALS_LOAD_ALL,
  GOALS_PERFORMANCE_REPORT_FETCH,
  GOALS_TABLE_RESET,
} from '../../action-types';

const resetGoalsTable = createAction(GOALS_TABLE_RESET);

const fetchGoals = {
  request: (organisationId, filter = {}) => createAction(GOALS_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(GOALS_FETCH.SUCCESS)(response),
  failure: (error) => createAction(GOALS_FETCH.FAILURE)(error)
};

const fetchGoalsPerformanceReport = {
  request: (organisationId, filter = {}) => createAction(GOALS_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(GOALS_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(GOALS_PERFORMANCE_REPORT_FETCH.FAILURE)(error)
};

const loadGoalsDataSource = (organisationId, filter) => createAction(GOALS_LOAD_ALL)({ organisationId, filter });

export {
  fetchGoals,
  fetchGoalsPerformanceReport,
  loadGoalsDataSource,
  resetGoalsTable
};
