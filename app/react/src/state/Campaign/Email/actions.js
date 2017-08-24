import { createAction } from 'redux-actions';

import {
  EMAIL_CAMPAIGN_ARCHIVE,
  EMAIL_CAMPAIGN_FETCH,
  EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH,
  EMAIL_CAMPAIGN_LOAD_ALL,
  EMAIL_CAMPAIGN_UPDATE,
  EMAIL_CAMPAIGN_RESET,
  EMAIL_BLAST_FETCH_ALL,
  EMAIL_BLAST_FETCH_PERFORMANCE,
} from '../../action-types';

const fetchEmailCampaign = {
  request: campaignId => createAction(EMAIL_CAMPAIGN_FETCH.REQUEST)({ campaignId }),
  success: createAction(EMAIL_CAMPAIGN_FETCH.SUCCESS),
  failure: createAction(EMAIL_CAMPAIGN_FETCH.FAILURE),
};

const fetchEmailCampaignDeliveryReport = {
  request: (organisationId, campaignId, filter = {}) => createAction(EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.REQUEST)({ organisationId, campaignId, filter }),
  success: createAction(EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.SUCCESS),
  failure: createAction(EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.FAILURE),
};

const loadEmailCampaignAndDeliveryReport = (organisationId, campaignId, filter) => createAction(EMAIL_CAMPAIGN_LOAD_ALL)({ organisationId, campaignId, filter });

const archiveEmailCampaign = {
  request: (campaignId, body) => createAction(EMAIL_CAMPAIGN_ARCHIVE.REQUEST)({ campaignId, body }),
  success: createAction(EMAIL_CAMPAIGN_ARCHIVE.SUCCESS),
  failure: createAction(EMAIL_CAMPAIGN_ARCHIVE.FAILURE),
};

const updateEmailCampaign = {
  request: (campaignId, body) => createAction(EMAIL_CAMPAIGN_UPDATE.REQUEST)({ campaignId, body }),
  success: createAction(EMAIL_CAMPAIGN_UPDATE.SUCCESS),
  failure: createAction(EMAIL_CAMPAIGN_UPDATE.FAILURE),
};

const resetEmailCampaign = createAction(EMAIL_CAMPAIGN_RESET);

const fetchAllEmailBlast = {
  request: campaignId => createAction(EMAIL_BLAST_FETCH_ALL.REQUEST)({ campaignId }),
  success: createAction(EMAIL_BLAST_FETCH_ALL.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH_ALL.FAILURE),
};

const fetchAllEmailBlastPerformance = {
  request: (campaignId, body) => createAction(EMAIL_BLAST_FETCH_PERFORMANCE.REQUEST)({ campaignId, body }),
  success: createAction(EMAIL_BLAST_FETCH_PERFORMANCE.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH_PERFORMANCE.FAILURE),
};

export {
  fetchEmailCampaign,
  fetchEmailCampaignDeliveryReport,
  loadEmailCampaignAndDeliveryReport,
  archiveEmailCampaign,
  updateEmailCampaign,
  resetEmailCampaign,
  fetchAllEmailBlast,
  fetchAllEmailBlastPerformance,
};
