import moment from 'moment';

import ApiService from './ApiService';
import { filterEmptyValues, formatKeysToPascalCase } from '../utils/ReduxFormHelper';

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
  return ApiService.getRequest(endpoint)
    .then(results => {
      const { data } = results;

      const neededKeys = [
        'bid_optimizer_id',
        'end_date',
        'max_budget_per_period',
        'max_budget_period',
        'name',
        'start_date',
        'technical_name',
        'total_budget',
      ];

      const filteredData = filterEmptyValues({ data, neededKeys })
        .reduce((acc, key) => {
          let value = data[key];

          if (key === 'start_date') {
            value = moment(value);
          } else if (key === 'end_date') {
            value = moment(value);
          }

          return { ...acc, [key]: value };
        }, {});

      return formatKeysToPascalCase({ data: filteredData, prefix: 'adGroup' });
    });
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
function getAudiences(campaignId, adGroupId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then(res => res.data.map(segment => {
    const { audience_segment_id, exclude, id, technical_name, ...relevantData } = segment;

    return {
      ...relevantData,
      id: audience_segment_id,
      include: !exclude,
      otherId: id,
      toBeRemoved: false,
    };
  }));
}

function createAudience(campaignId, adGroupId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, body).then(res => res.data);
}

function updateAudience(campaignId, adGroupId, segmentId, body) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteAudience(campaignId, adGroupId, segmentId) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${segmentId}`;
  return ApiService.deleteRequest(endpoint);
}

/* PUBLISHER SERVICES */
function getPublishers({ campaignId }) {
  const endpoint = `display_campaigns/${campaignId}/inventory_sources`;
  return ApiService.getRequest(endpoint)
    .then(res => res.data.map(({ display_network_access_id, id, ...publisher }) => ({
      ...publisher,
      id: display_network_access_id,
      otherId: id,
      toBeRemoved: false
    })));
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
  createAudience,
  deleteAudience,
  getAdGroup,
  getAds,
  getCampaignDisplay,
  getCampaignName,
  getPublishers,
  getAudiences,
  updateAd,
  updateAdGroup,
  updateCampaign,
  updateAudience
};
