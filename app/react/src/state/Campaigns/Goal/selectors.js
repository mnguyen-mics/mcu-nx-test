import { createSelector } from 'reselect';

const getGoals = state => state.goalsTable.goalsApi.data;
const getPerformanceReportRows = state => state.goalsTable.performanceReportApi.report_view.rows;
const getPerformanceReportHeaders = state => state.goalsTable.performanceReportApi.report_view.columns_headers;

const getGoalsById = createSelector(
    getGoals,
    goals => goals.reduce((acc, goal) => {
      acc[goal.id] = goal; // eslint-disable-line no-param-reassign
      return acc;
    }, {})
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportHeaders,
  getPerformanceReportRows,
  (headers, rows) => rows.map(row => {
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index]; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  })
);

const getStatByGoalId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => array.reduce((acc, reportObject) => {
    acc[reportObject.goal_id] = reportObject; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
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
