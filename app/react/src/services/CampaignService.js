import ApiService from './ApiService';

const getCampaignEmail = (campaignId) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint);
};

const updateCampaignEmail = (campaignId, body) => {
  const endpoint = `email_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const getCampaigns = (organisationId, campaignType, options = {}) => {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
};

export default {
  getCampaignEmail,
  updateCampaignEmail,
  getCampaigns
};
