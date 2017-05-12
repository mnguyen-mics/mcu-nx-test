import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getCampaignsEmail = state => state.campaignsEmailTable.campaignsEmailApi.data;
const getDeliveryReportView = state => state.campaignsEmailTable.deliveryReportApi.report_view;

const getCampaignsEmailById = createSelector(
  getCampaignsEmail,
  campaignsEmail => normalizeArrayOfObject(campaignsEmail, 'id')
);

const convertDeliveryReportToObjectArray = createSelector(
  getDeliveryReportView,
  (reportView) => normalizeReportView(reportView)
);

const getStatByCampaignId = createSelector(
  convertDeliveryReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'campaign_id')
);

const getTableDataSource = createSelector(
  getCampaignsEmailById,
  getStatByCampaignId,
  (campaignsEmail, statistics) => {
    return Object.keys(campaignsEmail).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...campaignsEmail[campaignId]
      };
    });
  }
);

export {
  getTableDataSource
};
