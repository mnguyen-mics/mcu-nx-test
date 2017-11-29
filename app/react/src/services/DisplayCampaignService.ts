import { AdGroupResponseList } from './../models/campaign/display/AdGroupResource';
import { DisplayCampaignResponse } from './../models/campaign/display/DisplayCampaignResource';
import moment from 'moment';
import ApiService from './ApiService';
import { filterEmptyValues } from '../utils/ReduxFormHelper';

/* CAMPAIGN SERVICES */
function getCampaignDisplay(
  campaignId: string,
  params: object = {},
): Promise<DisplayCampaignResponse> {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.getRequest(endpoint, params);
}

function getCampaignName(
  campaignId: string,
): Promise<DisplayCampaignResponse> {
  return getCampaignDisplay(campaignId).then((res: any) => res.data.name);
}

function createCampaign<T>(
  organisationId: string,
  body: object,
): Promise<T> {
  const endpoint = `display_campaigns/?organisation_id=${organisationId}`;
  return ApiService.postRequest(endpoint, body);
}

function updateCampaign<T>(
  campaignId: string,
  body: object,
): Promise<T> {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteCampaign<T>(
  campaignId: string,
  body: object,
): Promise<T> {
  const endpoint = `display_campaigns/${campaignId}`;
  return ApiService.deleteRequest(endpoint, body);
}

/* AD GROUP SERVICES */
function getAdGroup(
  campaignId: string,
  adGroupId: string,
) {
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

function getAdGroups(
  campaignId: string,
): Promise<AdGroupResponseList> {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
  return ApiService.getRequest(endpoint);
}

function createAdGroup(
  campaignId: string,
  body: object,
) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups`;
  return ApiService.postRequest(endpoint, body);
}

function updateAdGroup(
  campaignId: string,
  adGroupId: string,
  body: object,
) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
  return ApiService.putRequest(endpoint, body);
}

function deleteAdGroup(
  adGroupData: {
    campaignId: string,
    id: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${adGroupData.campaignId}/ad_groups/${adGroupData.id}`;
  return ApiService.deleteRequest(endpoint, adGroupData.body);
}

/* AUDIENCE SERVICES */
function getAudienceSegments(
  campaignId: string,
  adGroupId: string,
) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then((res: any) => res.data);
}

// TODO delete, use getAudienceSegments instead
function getAudiences(
  campaignId: string,
  adGroupId: string,
) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
  return ApiService.getRequest(endpoint).then((res: any) => res.data.map((segment: any) => {
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

function createAudience(
  audienceData: {
    campaignId: string,
    adGroupId: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${audienceData.campaignId}/ad_groups/${audienceData.adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, audienceData.body).then((res: any) => res.data);
}

function createAudienceSegment(
  audienceSegmentData: {
    campaignId: string,
    adGroupId: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${audienceSegmentData.campaignId}/ad_groups/${audienceSegmentData.adGroupId}/audience_segments`;
  return ApiService.postRequest(endpoint, audienceSegmentData.body).then((res: any) => res.data);
}

function updateAudience(
  audienceData: {
    campaignId: string,
    adGroupId: string,
    id: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${audienceData.campaignId}/ad_groups/${audienceData.adGroupId}/audience_segments/${audienceData.id}`;
  return ApiService.putRequest(endpoint, audienceData.body);
}

function updateAudienceSegment(
  audienceSegmentData: {
    campaignId: string,
    adGroupId: string,
    id: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/
    ${audienceSegmentData.campaignId}/ad_groups/
    ${audienceSegmentData.adGroupId}/audience_segments/${audienceSegmentData.id}`;
  return ApiService.putRequest(endpoint, audienceSegmentData.body).then((res: any) => res.data);
}

function deleteAudience(
  audienceData: {
    campaignId: string,
    adGroupId: string,
    id: string,
  }) {
  const endpoint = `display_campaigns/${audienceData.campaignId}/ad_groups/${audienceData.adGroupId}/audience_segments/${audienceData.id}`;
  return ApiService.deleteRequest(endpoint);
}

/* PUBLISHER SERVICES */
function getPublishers(
  campaignData: {
    campaignId: string,
  }) {
  const endpoint = `display_campaigns/${campaignData.campaignId}/inventory_sources`;
  return ApiService.getRequest(endpoint)
    .then((res: any) => res.data.map((elem: any) => {
      const { display_network_access_id, id, ...publisher } = elem;

      return {
        ...publisher,
        display_network_access_id,
        id: display_network_access_id,
        modelId: id,
        toBeRemoved: false,
      };
    }));
}

function createPublisher(
  campaignData: {
    campaignId: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${campaignData.campaignId}/inventory_sources/`;
  return ApiService.postRequest(endpoint, campaignData.body);
}

function deletePublisher(
  campaignData: {
    campaignId: string,
    id: string,
  }) {
  const endpoint = `display_campaigns/${campaignData.campaignId}/inventory_sources/${campaignData.id}`;
  return ApiService.deleteRequest(endpoint);
}

/* AD SERVICES */
function getAds(
  campaignId: string,
  adGroupId: string,
) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
  return ApiService.getRequest(endpoint);
}

function updateAd(
  adId: string,
  campaignId: string,
  adGroupId: string,
  body: object) {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
  return ApiService.putRequest(endpoint, body);
}

function createAd(
  adRelatedData: {
    campaignId: string,
    adGroupId: string,
    body: object,
  }) {
  const endpoint = `display_campaigns/${adRelatedData.campaignId}/ad_groups/${adRelatedData.adGroupId}/ads`;
  return ApiService.postRequest(endpoint, adRelatedData.body);
}

function deleteAd(
  adRelatedData: {
    campaignId: string,
    adGroupId: string,
    id: string,
  }) {
  const endpoint = `display_campaigns/${adRelatedData.campaignId}/ad_groups/${adRelatedData.adGroupId}/ads/${id}`;
  return ApiService.deleteRequest(endpoint);
}

/* GOAL SERVICES */
function getGoal(
  goalRelatedData: {
    campaignId: string,
    options: object,
  }) {
  const endpoint = `campaigns/${goalRelatedData.campaignId}/goal_selections`;
  return ApiService.getRequest(endpoint, goalRelatedData.options);
}

function createGoal(
  goalRelatedData: {
    campaignId: string,
    body: object,
  }) {
  const endpoint = `campaigns/${goalRelatedData.campaignId}/goal_selections`;
  return ApiService.postRequest(endpoint, goalRelatedData.body);
}

function updateGoal(
  goalRelatedData: {
    campaignId: string,
    id: string,
    body: object,
  }) {
  const endpoint = `campaigns/${goalRelatedData.campaignId}/goal_selections/${goalRelatedData.id}`;
  return ApiService.putRequest(endpoint, goalRelatedData.body);
}

function deleteGoal(
  goalRelatedData: {
    campaignId: string,
    id: string,
    body: object,
  }) {
  const endpoint = `campaigns/${goalRelatedData.campaignId}/goal_selections/${goalRelatedData.id}`;
  return ApiService.deleteRequest(endpoint, goalRelatedData.body);
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
