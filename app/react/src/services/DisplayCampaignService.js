import moment from 'moment';
import ApiService from './ApiService';
import { filterEmptyValues } from '../utils/ReduxFormHelper';

/* CAMPAIGN SERVICES */
function getCampaignDisplay(campaignId, params = '') {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint, params);
}

function getCampaignName(campaignId) {
  return getCampaignDisplay(campaignId).then(res => res.data.name);
}

function createCampaign(organisationId, body) {
  const endpoint = `display_campaigns/?organisation_id=${organisationId}`;
  return ApiService.postRequest(endpoint, body);
}

function updateCampaign(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteCampaign(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.deleteRequest(endpoint, body);
}

/* AD GROUP SERVICES */
function getAdGroup(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.getRequest(endpoint)
    .then(({ data }) => (
      filterEmptyValues(data).reduce((acc, key) => {
        let value = data[key];

        if (key === 'start_date') {
          value = moment(value);
        } else if (key === 'end_date') {
          value = moment(value);
        }

        return { ...acc, [key]: value };
      }, {})
    ));
}

function getAdGroups(campaignId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
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

function deleteAdGroup({ campaignId, id, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${id}`;
  return ApiService.deleteRequest(endpoint, body);
}

/* AUDIENCE SERVICES */
function getAudienceSegments(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then(res => res.data);
}

// TODO delete, use getAudienceSegments instead
function getAudiences(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then(res => res.data.map(segment => {
    const { audience_segment_id, exclude, id, technical_name, ...relevantData } = segment;

    // code smell...
    return {
      ...relevantData,
      id: audience_segment_id,
      include: !exclude,
      modelId: id,
      toBeRemoved: false,
    };
  }));
}

function createAudience({ campaignId, adGroupId, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, body).then(res => res.data);
}

function createAudienceSegment({ campaignId, adGroupId, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, body).then(res => res.data);
}

function updateAudience({ campaignId, adGroupId, id, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
  return ApiService.putRequest(endpoint, body);
}

function updateAudienceSegment({ campaignId, adGroupId, id, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
  return ApiService.putRequest(endpoint, body).then(res => res.data);
}

function deleteAudience({ campaignId, adGroupId, id }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
  return ApiService.deleteRequest(endpoint);
}

/* PUBLISHER SERVICES */
function getPublishers({ campaignId }) {
  const endpoint = `display_campaigns/${campaignId}/inventory_sources`;
  return ApiService.getRequest(endpoint)
    .then(res => res.data.map((elem) => {
      const { display_network_access_id, id, ...publisher } = elem;

      return {
        ...publisher,
        display_network_access_id,
        id: display_network_access_id,
        modelId: id,
        toBeRemoved: false
      };
    }));
}

function createPublisher({ campaignId, body }) {
  const endpoint = `display_campaigns/${campaignId}/inventory_sources/`;
  return ApiService.postRequest(endpoint, body);
}

function deletePublisher({ campaignId, id }) {
  const endpoint = `display_campaigns/${campaignId}/inventory_sources/${id}`;
  return ApiService.deleteRequest(endpoint);
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

function createAd({ campaignId, adGroupId, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.postRequest(endpoint, body);
}

function deleteAd({ campaignId, adGroupId, id }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${id}`;
  return ApiService.deleteRequest(endpoint);
}

/* GOAL SERVICES */
function getGoal({ campaignId, options = {} }) {
  const endpoint = `campaigns/${campaignId}/goal_selections`;
  return ApiService.getRequest(endpoint, options);
}

function createGoal({ campaignId, body }) {
  const endpoint = `campaigns/${campaignId}/goal_selections`;
  return ApiService.postRequest(endpoint, body);
}

function updateGoal({ campaignId, id, body }) {
  const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteGoal({ campaignId, id, body }) {
  const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
  return ApiService.deleteRequest(endpoint, body);
}

export default {
  createAd,
  createAdGroup,
  createAudience,
  createAudienceSegment,
  createCampaign,
  createGoal,
  createPublisher,
  deleteAd,
  deleteAudience,
  deleteGoal,
  deletePublisher,
  getAdGroup,
  getAdGroups,
  getAds,
  getCampaignDisplay,
  getCampaignName,
  getGoal,
  getPublishers,
  getAudiences,
  getAudienceSegments,
  updateAd,
  updateAdGroup,
  updateAudience,
  updateAudienceSegment,
  updateCampaign,
  updateGoal,
  deleteAdGroup,
  deleteCampaign,
};
