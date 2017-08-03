import ApiService from './ApiService';

const getCampaignDisplay = (campaignId) => {
  const endpoint = `display_campaigns/${campaignId}?view=deep`;
  return ApiService.getRequest(endpoint);
};

const getAdGroup = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint);
};

const getAds = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
};

const updateCampaignDisplay = (campaignId, body) => {
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
  updateCampaignDisplay,
  updateAdGroup,
  updateAd,
};
