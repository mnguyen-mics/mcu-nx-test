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

/* SEGMENTS SERVICES */
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

/* ADS SERVICES */
function getAds(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
}

function updateAd(adId, campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
}

/* BID OPTIMIZERS SERVICES */
function getBidOptimizers(organisationId) {
  const endpoint = `bid_optimizers?organisation_id=${organisationId}`;

  return ApiService.getRequest(endpoint).then(res => res.data);
}

function getEngineProperties(engineVersionId) {
  const endpoint = `plugins/${engineVersionId}/properties`;

  return ApiService.getRequest(endpoint).then(res => res.data);
}

function getEngineVersion(engineVersionId) {
  const endpoint = `plugins/version/${engineVersionId}`;

  return ApiService.getRequest(endpoint).then(res => res.data);
}

export default {
  createAdGroup,
  createSegment,
  deleteSegment,
  getAdGroup,
  getAds,
  getBidOptimizers,
  getCampaignDisplay,
  getCampaignName,
  getEngineProperties,
  getEngineVersion,
  getSegments,
  updateAd,
  updateAdGroup,
  updateCampaign,
  updateSegment
};
