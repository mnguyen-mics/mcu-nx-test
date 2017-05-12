import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getCampaignsDisplay = state => state.campaignsDisplayTable.campaignsDisplayApi.data;
const getPerformanceReportView = state => state.campaignsDisplayTable.performanceReportApi.report_view;

const getCampaignsDisplayById = createSelector(
  getCampaignsDisplay,
  campaignsDisplay => normalizeArrayOfObject(campaignsDisplay, 'id')
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportView,
  (reportView) => normalizeReportView(reportView)
);

const getStatByCampaignId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'campaign_id')
);

const getTableDataSource = createSelector(
  getCampaignsDisplayById,
  getStatByCampaignId,
  (campaignsDisplay, statistics) => {
    return Object.keys(campaignsDisplay).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...campaignsDisplay[campaignId]
      };
    });
  }
);

export {
  getTableDataSource
};
