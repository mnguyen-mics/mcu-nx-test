import ApiService from './ApiService';

/* CAMPAIGN SERVICES */
const getCampaignDisplay = (campaignId, params = '') => {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint, params);
};

const updateCampaign = (campaignId, body) => {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
};

/* AD GROUP SERVICES */
const getAdGroup = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint);
};

const createAdGroup = (campaignId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
  return ApiService.postRequest(endpoint, body);
};

const updateAdGroup = (campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
};

/* SEGMENTS SERVICES */
const createSegment = (campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, body).then(res => res.data);
};

const updateSegment = (campaignId, adGroupId, segmentId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.putRequest(endpoint, body);
};

const deleteSegment = (campaignId, adGroupId, segmentId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.deleteRequest(endpoint);
};

/* ADS SERVICES */
const getAds = (campaignId, adGroupId) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
};

const updateAd = (adId, campaignId, adGroupId, body) => {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
};

export default {
  createAdGroup,
  createSegment,
  deleteSegment,
  getCampaignDisplay,
  getAdGroup,
  getAds,
  updateAd,
  updateAdGroup,
  updateCampaign,
  updateSegment
};
