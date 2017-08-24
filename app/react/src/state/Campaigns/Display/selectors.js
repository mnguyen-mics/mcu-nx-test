import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getDisplayCampaigns = state => state.displayCampaignsTable.displayCampaignsApi.data;
const getPerformanceReportView = state => state.displayCampaignsTable.performanceReportApi.report_view;

const getDisplayCampaignsById = createSelector(
  getDisplayCampaigns,
  displayCampaigns => normalizeArrayOfObject(displayCampaigns, 'id'),
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportView,
  (reportView) => normalizeReportView(reportView),
);

const getStatByCampaignId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'campaign_id'),
);

const getTableDataSource = createSelector(
  getDisplayCampaignsById,
  getStatByCampaignId,
  (displayCampaigns, statistics) => {
    return Object.keys(displayCampaigns).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...displayCampaigns[campaignId],
      };
    });
  },
);

export {
  getTableDataSource,
};
