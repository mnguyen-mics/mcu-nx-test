import { createSelector } from 'reselect';

import { normalizeReportView, formatNormalizeReportView } from '../../../utils/MetricHelper.ts';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

const getEmailPerformanceData = state => state.emailCampaignSingle.emailCampaignPerformance.report_view;

const getEmailBlast = state => state.emailCampaignSingle.emailBlastApi.data;
const getEmailBlastReportView = state => state.emailCampaignSingle.emailBlastPerformance.report_view;


const getTableDataSource = createSelector(
  getEmailPerformanceData,
  normalizeReportView,
);

const normalizedEmailPerformance = createSelector(
  getTableDataSource,
  formatNormalizeReportView,
);

const getEmailBlastById = createSelector(
  getEmailBlast,
  emailBlast => normalizeArrayOfObject(emailBlast, 'id'),
);

const convertDeliveryReportToObjectArray = createSelector(
  getEmailBlastReportView,
  (reportView) => normalizeReportView(reportView),
);

const getStatByBlastId = createSelector(
  convertDeliveryReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'sub_campaign_id'),
);

const getEmailBlastTableView = createSelector(
  getEmailBlastById,
  getStatByBlastId,
  (emailBlast, statistics) => {
    return Object.keys(emailBlast).map((blastId) => {
      return {
        ...statistics[blastId],
        ...emailBlast[blastId],
      };
    });
  },
);

export {
  getTableDataSource,
  normalizedEmailPerformance,
  getEmailBlastTableView,
};
