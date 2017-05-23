import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getGoals = state => state.goalsTable.goalsApi.data;
const getPerformanceReportView = state => state.goalsTable.performanceReportApi.report_view;

const getGoalsById = createSelector(
    getGoals,
    goals => normalizeArrayOfObject(goals, 'id')
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportView,
  (reportView) => normalizeReportView(reportView)
);

const getStatByGoalId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'goal_id')
);

const getTableDataSource = createSelector(
  getGoalsById,
  getStatByGoalId,
  (goals, statistics) => {
    return Object.keys(goals).map((goalId) => {
      return {
        ...statistics[goalId],
        ...goals[goalId]
      };
    });
  }
);

export {
    getTableDataSource
};
