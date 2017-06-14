import { createSelector } from 'reselect';

import { normalizeReportView, formatNormalizeReportView } from '../../../utils/MetricHelper';

const getEmailPerformanceData = state => state.emailBlastSingle.emailBlastPerformance.report_view;


const getTableDataSource = createSelector(
  getEmailPerformanceData,
  normalizeReportView
);

const flattenData = createSelector(
  getTableDataSource,
  formatNormalizeReportView
);

export {
  getTableDataSource,
  flattenData
};
