import { createAction } from '../../../utils/ReduxHelper';

import {
  CAMPAIGN_EMAIL_ARCHIVE,
  CAMPAIGN_EMAIL_FETCH,
  CAMPAIGN_EMAIL_UPDATE,
  CAMPAIGN_EMAIL_RESET
} from '../../action-types';

const fetchCampaignEmail = {
  request: campaignId => createAction(CAMPAIGN_EMAIL_FETCH.REQUEST)({ campaignId }),
  success: createAction(CAMPAIGN_EMAIL_FETCH.SUCCESS),
  failure: createAction(CAMPAIGN_EMAIL_FETCH.FAILURE)
};

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

export {
  fetchCampaignEmail,
  archiveCampaignEmail,
  updateCampaignEmail,
  resetCampaignEmail
};
