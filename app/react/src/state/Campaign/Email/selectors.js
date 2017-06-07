import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';

const getEmailPerformanceData = state => state.campaignEmailSingle.campaignEmailPerformance.report_view;


const getTableDataSource = createSelector(
  getEmailPerformanceData,
  normalizeReportView
);

export {
  getTableDataSource
};
