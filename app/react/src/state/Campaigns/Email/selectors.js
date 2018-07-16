import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper.ts';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

const getEmailCampaigns = state => state.emailCampaignsTable.emailCampaignsApi.data;
const getDeliveryReportView = state => state.emailCampaignsTable.deliveryReportApi.report_view;

const getEmailCampaignsById = createSelector(
  getEmailCampaigns,
  emailCampaigns => normalizeArrayOfObject(emailCampaigns, 'id'),
);

const convertDeliveryReportToObjectArray = createSelector(
  getDeliveryReportView,
  (reportView) => normalizeReportView(reportView),
);

const getStatByCampaignId = createSelector(
  convertDeliveryReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'campaign_id'),
);

const getTableDataSource = createSelector(
  getEmailCampaignsById,
  getStatByCampaignId,
  (emailCampaigns, statistics) => {
    return Object.keys(emailCampaigns).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...emailCampaigns[campaignId],
      };
    });
  },
);

export {
  getTableDataSource,
};
