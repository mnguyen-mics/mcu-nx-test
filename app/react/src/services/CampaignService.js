import ApiService from './ApiService';

function getCampaigns(organisationId, campaignType, options = {}) {
  const endpoint = 'campaigns';

  const params = {
    organisation_id: organisationId,
    campaign_type: campaignType,
    ...options
  };

  return ApiService.getRequest(endpoint, params);
}

export default {
  getCampaigns
};
