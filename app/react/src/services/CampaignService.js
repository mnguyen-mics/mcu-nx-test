import ApiService from './ApiService';

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
  getCampaigns
};
