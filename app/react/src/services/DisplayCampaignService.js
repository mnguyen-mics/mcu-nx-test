import ApiService from './ApiService';

const getCampaignDisplay = (campaignId, params = '') => {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint, params);
};

const getAdGroup = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint);
};

const getAds = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
};

const updateCampaign = (campaignId, body) => {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

const updateAdGroup = (campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
};

const updateAd = (adId, campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
};

export default {
  getCampaignDisplay,
  getAdGroup,
  getAds,
  updateCampaign,
  updateAdGroup,
  updateAd,
};
