import moment from 'moment';
import { InventorySourceResource } from './../models/campaign/display/InventorySourceResource';
import { AdGroupResponseList, AdGroupResource } from './../models/campaign/display/AdGroupResource';
import { DisplayCampaignResource } from './../models/campaign/display/DisplayCampaignResource';
import { CampaignResource } from '../models/campaign/CampaignResource';
import { DisplayCampaignInfoResource } from './../models/campaign/display/DisplayCampaignInfoResource';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { filterEmptyValues } from '../utils/ReduxFormHelper';
import { AudienceSegmentSelectionResource } from '../models/audiencesegment';
import { AdResource } from '../models/campaign/display/AdResource';
import { GoalSelectionResource } from '../models/goal/GoalSelectionResource';
import { PlacementListSelectionResource } from '../models/placement/PlacementListResource';

const DisplayCampaignService = {

  /* CAMPAIGN SERVICES */
  getCampaignDisplay(
    campaignId: string,
    params: object = {},
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.getRequest(endpoint, params);
  },

  getCampaignDisplayViewDeep(
    campaignId: string,
    params: object = {},
  ): Promise<DataResponse<DisplayCampaignInfoResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.getRequest(endpoint, params);
  },

  getCampaignName(
    campaignId: string,
  ): Promise<string> {
    return DisplayCampaignService.getCampaignDisplay(campaignId)
      .then((res: DataResponse<DisplayCampaignResource>) => res.data.name);
  },

  createCampaign(
    organisationId: string,
    body: object,
  ): Promise<CampaignResource> {
    const endpoint = `display_campaigns/?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },

  updateCampaign(
    campaignId: string,
    body: object,
  ): Promise<CampaignResource> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteCampaign(
    campaignId: string,
    body: object,
  ): Promise<CampaignResource> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.deleteRequest(endpoint, body);
  },

  /* AD GROUP SERVICES */
  getAdGroup(
    campaignId: string,
    adGroupId: string,
  ): Promise<AdGroupResource> {
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
      )) as Promise<AdGroupResource>;
  },

  getAdGroups(
    campaignId: string,
  ): Promise<AdGroupResponseList> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.getRequest(endpoint);
  },

  createAdGroup(
    campaignId: string,
    body: object,
  ): Promise<AdGroupResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.postRequest(endpoint, body);
  },

  updateAdGroup(
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<AdGroupResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteAdGroup(
    campaignId: string,
    adGroupId: string,
  ): Promise<AdGroupResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* AUDIENCE SERVICES */
  getAudienceSegments(
    campaignId: string,
    adGroupId: string,
  ): Promise<AudienceSegmentSelectionResource[]> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.getRequest(endpoint).then((res: DataResponse<AudienceSegmentSelectionResource[]>) => res.data);
  },

  // TODO delete, use getAudienceSegments instead
  getAudiences(
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
  },

  createAudience(
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<AudienceSegmentSelectionResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.postRequest(endpoint, body).then((res: DataResponse<AudienceSegmentSelectionResource>) => res.data);
  },

  createAudienceSegment(
    campaignId: string,
    adGroupId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.postRequest(endpoint, body).then((res: DataResponse<AudienceSegmentSelectionResource>) => res.data);
  },

  updateAudience(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: object,
  ): Promise<AudienceSegmentSelectionResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  updateAudienceSegment(
    campaignId: string,
    adGroupId: string,
    audienceSegmentId: string,
    body: Partial<AudienceSegmentSelectionResource>,
   ): Promise<AudienceSegmentSelectionResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${audienceSegmentId}`;
    return ApiService.putRequest(endpoint, body).then((res: DataResponse<AudienceSegmentSelectionResource>) => res.data);
  },

  deleteAudience(
      campaignId: string,
      adGroupId: string,
      id: string,
    ): Promise<AudienceSegmentSelectionResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* PUBLISHER SERVICES */
  getPublishers(
      campaignId: string,
    ): Promise<InventorySourceResource[]> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources`;
    return ApiService.getRequest(endpoint)
      .then((res: DataResponse<InventorySourceResource[]>) => res.data.map((elem: InventorySourceResource) => {
        const { display_network_access_id, id, ...publisher } = elem;

        return {
          ...publisher,
          display_network_access_id,
          id: display_network_access_id,
          modelId: id,
          toBeRemoved: false,
        };
      }));
  },

  createPublisher(
      campaignId: string,
      body: object,
    ): Promise<InventorySourceResource> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources/`;
    return ApiService.postRequest(endpoint, body);
  },

  deletePublisher(
      campaignId: string,
      id: string,
    ): Promise<InventorySourceResource> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources/${id}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* AD SERVICES */
  getAds(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
    return ApiService.getRequest(endpoint);
  },

  updateAd(
    adId: string,
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<AdResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
    return ApiService.putRequest(endpoint, body);
  },

  createAd(
      campaignId: string,
      adGroupId: string,
      body: Partial<AdResource>,
    ): Promise<AdResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
    return ApiService.postRequest(endpoint, body);
  },

  deleteAd(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<AdResource>  {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${id}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* GOAL SERVICES */
  getGoal(
    campaignId: string,
    options: object,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.getRequest(endpoint, options);
  },

  createGoal(
    campaignId: string,
    body: object,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.postRequest(endpoint, body);
  },

  updateGoal(
    campaignId: string,
    id: string,
    body: object,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteGoal(
    campaignId: string,
    id: string,
    body: object,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.deleteRequest(endpoint, body);
  },

  /* LOCATION SERVICES */

  createLocation(
    campaignId: string,
    adGroupId: string,
    body: object,
  ) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.postRequest(endpoint, body);
  },

  deleteLocation(
    campaignId: string,
    adGroupId: string,
    id: string,
  ) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.deleteRequest(endpoint);
  },
  getLocations(
    campaignId: string,
    adGroupId: string,
  ) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.getRequest(endpoint);
  },
  updateLocation(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: object,
  ) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  /* PLACEMENT LIST SERVICES */
  getPlacementLists(
    campaignId: string,
    adGroupId: string,
    options: object = {},
  ): Promise<DataListResponse<PlacementListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/placement_lists`;
    return ApiService.getRequest(endpoint, options);
  },

  createPlacementList(
      campaignId: string,
      adGroupId: string,
      body: Partial<PlacementListSelectionResource>,
  ): Promise<DataResponse<PlacementListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/placement_lists`;
    return ApiService.postRequest(endpoint, body);
  },

  updatePlacementList(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<PlacementListSelectionResource>,
  ): Promise<DataResponse<PlacementListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/placement_lists/${id}`;
    return ApiService.putRequest(endpoint, body);
  },
  deletePlacementList(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
  const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/placement_lists/${id}`;
  return ApiService.deleteRequest(endpoint, {});
},
};

export default DisplayCampaignService;
