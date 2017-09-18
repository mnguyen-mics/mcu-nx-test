import ApiService from './ApiService';

/* CAMPAIGN SERVICES */
function getCampaignDisplay(campaignId, params = '') {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint, params);
}

function getCampaignName(campaignId) {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint).then(res => res.data.name);
}

function updateCampaign(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
}

/* AD GROUP SERVICES */
function getAdGroup(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint);
}

function createAdGroup(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
  return ApiService.postRequest(endpoint, body);
}

function updateAdGroup(campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
}

/* SEGMENT SERVICES */
function getSegments(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then(res => res.data);
}

function createSegment(campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, body).then(res => res.data);
}

function updateSegment(campaignId, adGroupId, segmentId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteSegment(campaignId, adGroupId, segmentId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.deleteRequest(endpoint);
}

/* PUBLISHER SERVICES */
function getAllPublishers(organisationId) {
  const endpoint = `display_network_accesses?organisation_id=${organisationId}`; // TODO remove
  return ApiService.getRequest(endpoint).then(res => res.data);
}

function getSelectedPublishers(campaignId) {
  const endpoint = `display_campaigns/${campaignId}/inventory_sources`;
  return ApiService.getRequest(endpoint).then(res => res.data);
}

/* AD SERVICES */
function getAds(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
}

function updateAd(adId, campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
}

export default {
  createAdGroup,
  createSegment,
  deleteSegment,
  getAdGroup,
  getAds,
  getAllPublishers,
  getCampaignDisplay,
  getCampaignName,
  getSegments,
  getSelectedPublishers,
  updateAd,
  updateAdGroup,
  updateCampaign,
  updateSegment
};

export {
  createAdGroup,
  createSegment,
  deleteSegment,
  getAdGroup,
  getAds,
  getAllPublishers,
  getCampaignDisplay,
  getCampaignName,
  getSegments,
  getSelectedPublishers,
  updateAd,
  updateAdGroup,
  updateCampaign,
  updateSegment
};
