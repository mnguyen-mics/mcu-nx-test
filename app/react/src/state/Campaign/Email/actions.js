import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGN_EMAIL_ARCHIVE,
  CAMPAIGN_EMAIL_FETCH,
  CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGN_EMAIL_LOAD_ALL,
  CAMPAIGN_EMAIL_UPDATE,
  CAMPAIGN_EMAIL_RESET,
  EMAIL_BLAST_FETCH_ALL,
  EMAIL_BLAST_FETCH_PERFORMANCE
} from '../../action-types';

const fetchCampaignEmail = {
  request: campaignId => createAction(CAMPAIGN_EMAIL_FETCH.REQUEST)({ campaignId }),
  success: createAction(CAMPAIGN_EMAIL_FETCH.SUCCESS),
  failure: createAction(CAMPAIGN_EMAIL_FETCH.FAILURE)
};

const fetchCampaignEmailDeliveryReport = {
  request: (campaignId, filter = {}) => createAction(CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.REQUEST)({ campaignId, filter }),
  success: createAction(CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.SUCCESS),
  failure: createAction(CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.FAILURE)
};

const loadCampaignEmailAndDeliveryReport = (campaignId, filter) => createAction(CAMPAIGN_EMAIL_LOAD_ALL)({ campaignId, filter });

const archiveCampaignEmail = {
  request: (campaignId, body) => createAction(CAMPAIGN_EMAIL_ARCHIVE.REQUEST)({ campaignId, body }),
  success: createAction(CAMPAIGN_EMAIL_ARCHIVE.SUCCESS),
  failure: createAction(CAMPAIGN_EMAIL_ARCHIVE.FAILURE)
};

const updateCampaignEmail = {
  request: (campaignId, body) => createAction(CAMPAIGN_EMAIL_UPDATE.REQUEST)({ campaignId, body }),
  success: createAction(CAMPAIGN_EMAIL_UPDATE.SUCCESS),
  failure: createAction(CAMPAIGN_EMAIL_UPDATE.FAILURE)
};

const resetCampaignEmail = createAction(CAMPAIGN_EMAIL_RESET);

const fetchAllEmailBlast = {
  request: campaignId => createAction(EMAIL_BLAST_FETCH_ALL.REQUEST)({ campaignId }),
  success: createAction(EMAIL_BLAST_FETCH_ALL.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH_ALL.FAILURE)
};

const fetchAllEmailBlastPerformance = {
  request: (campaignId, body) => createAction(EMAIL_BLAST_FETCH_PERFORMANCE.REQUEST)({ campaignId, body }),
  success: createAction(EMAIL_BLAST_FETCH_PERFORMANCE.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH_PERFORMANCE.FAILURE)
};

export {
  fetchCampaignEmail,
  fetchCampaignEmailDeliveryReport,
  loadCampaignEmailAndDeliveryReport,
  archiveCampaignEmail,
  updateCampaignEmail,
  resetCampaignEmail,
  fetchAllEmailBlast,
  fetchAllEmailBlastPerformance
};
