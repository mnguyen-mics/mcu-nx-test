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

function updateCampaign(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
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

function createAdGroup(campaignId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
  return ApiService.postRequest(endpoint, body);
}

function updateAdGroup(campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
}

/* AUDIENCE SERVICES */
function getAudience(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then(res => res.data.map(segment => {
    const { audience_segment_id, exclude, id, technical_name, ...relevantData } = segment;

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

function updateAudience({ campaignId, adGroupId, id, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
  return ApiService.putRequest(endpoint, body);
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

function createAd({ campaignId, adGroupId, body }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.postRequest(endpoint, body);
}

function deleteAd({ campaignId, adGroupId, id }) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${id}`;
  return ApiService.deleteRequest(endpoint);
}

export default {
  createAd,
  createAdGroup,
  createAudience,
  createPublisher,
  deleteAd,
  deleteAudience,
  deletePublisher,
  getAdGroup,
  getAds,
  getCampaignDisplay,
  getCampaignName,
  getPublishers,
  getAudience,
  updateAdGroup,
  updateAudience,
  updateCampaign,
};
