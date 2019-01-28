import { InventorySourceResource } from './../models/campaign/display/InventorySourceResource';
import { AdGroupResource } from './../models/campaign/display/AdGroupResource';
import { DisplayCampaignResource } from './../models/campaign/display/DisplayCampaignResource';
import { DisplayCampaignInfoResource } from './../models/campaign/display/DisplayCampaignInfoResource';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { AudienceSegmentSelectionResource } from '../models/audiencesegment';
import { AdResource, AdCreateRequest } from '../models/campaign/display/AdResource';
import { GoalSelectionResource } from '../models/goal/GoalSelectionResource';
import { PlacementListSelectionResource } from '../models/placement/PlacementListResource';
import { LocationSelectionResource, LocationSelectionCreateRequest } from '../containers/Campaigns/Display/Edit/AdGroup/sections/Location/domain';
import { GoalSelectionCreateRequest } from '../models/goal/index';
import { KeywordListSelectionResource, KeywordListSelectionCreateRequest } from '../models/keywordList/keywordList';
import { DealsListSelectionCreateRequest, DealsListSelectionResource } from '../models/dealList/dealList';
import { AdExchangeSelectionCreateRequest, AdExchangeSelectionResource } from '../models/adexchange/adexchange';
import { DisplayNetworkSelectionCreateRequest, DisplayNetworkSelectionResource } from '../models/displayNetworks/displayNetworks'

const DisplayCampaignService = {

  /* CAMPAIGN SERVICES */
  getCampaignDisplay(
    campaignId: string,
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.getRequest(endpoint);
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
    body: Partial<DisplayCampaignResource>,
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns`;
    return ApiService.postRequest(endpoint, { ...body, type: 'DISPLAY' });
  },

  updateCampaign(
    campaignId: string,
    body: Partial<DisplayCampaignResource>,
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.putRequest(endpoint, { ...body, type: 'DISPLAY' });
  },

  deleteCampaign(
    campaignId: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* AD GROUP SERVICES */
  getAdGroup(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.getRequest(endpoint);
  },

  getAdGroups(
    campaignId: string,
  ): Promise<DataListResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.getRequest(endpoint);
  },

  createAdGroup(
    campaignId: string,
    body: object,
  ): Promise<DataResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.postRequest(endpoint, body);
  },

  updateAdGroup(
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<DataResponse<AdGroupResource>> {
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
  ): Promise<DataListResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.getRequest(endpoint);
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

  createAudienceSegment(
    campaignId: string,
    adGroupId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ): Promise<DataResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.postRequest(endpoint, body);
  },

  updateAudienceSegment(
    campaignId: string,
    adGroupId: string,
    audienceSegmentId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ): Promise<DataResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${audienceSegmentId}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteAudienceSegment(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
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
  getAd(
    campaignId: string,
    adGroupId: string,
    adId: string
  ): Promise<DataResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
    return ApiService.getRequest(endpoint);
  },

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
  ): Promise<DataResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
    return ApiService.putRequest(endpoint, body);
  },

  createAd(
    campaignId: string,
    adGroupId: string,
    body: AdCreateRequest,
  ): Promise<AdResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
    return ApiService.postRequest(endpoint, body);
  },

  deleteAd(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${id}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* GOAL SERVICES */
  getGoals(
    campaignId: string,
  ): Promise<DataListResponse<GoalSelectionResource>> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.getRequest(endpoint);
  },

  createGoal(
    campaignId: string,
    body: GoalSelectionCreateRequest,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.postRequest(endpoint, body);
  },

  updateGoal(
    campaignId: string,
    id: string,
    body: Partial<GoalSelectionCreateRequest>,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteGoal(
    campaignId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.deleteRequest(endpoint);
  },

  /* LOCATION SERVICES */

  createLocation(
    campaignId: string,
    adGroupId: string,
    body: Partial<LocationSelectionCreateRequest>,
  ): Promise<DataResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.postRequest(endpoint, body);
  },

  deleteLocation(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.deleteRequest(endpoint);
  },
  getLocations(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.getRequest(endpoint);
  },
  updateLocation(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<LocationSelectionCreateRequest>,
  ): Promise<DataResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  /* PLACEMENT LIST SERVICES */
  getPlacementLists(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<PlacementListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/placement_lists`;
    return ApiService.getRequest(endpoint);
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

  // KEYWORD LIST
  getKeywordList(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<KeywordListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/keyword_lists`;
    return ApiService.getRequest(endpoint);
  },

  getKeywordListSelection(
    campaignId: string,
    adGroupId: string,
    id:string
  ): Promise<DataResponse<KeywordListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/keyword_lists/${id}`;
    return ApiService.getRequest(endpoint);
  },

  createKeywordList(
    campaignId: string,
    adGroupId: string,
    body: Partial<KeywordListSelectionCreateRequest>,
  ): Promise<DataResponse<KeywordListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/keyword_lists`;
    return ApiService.postRequest(endpoint, body);
  },

  updateKeywordList(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<KeywordListSelectionResource>,
  ): Promise<DataResponse<KeywordListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/keyword_lists/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteKeywordList(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/keyword_lists/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  },

  // DEAL LIST
  getDealsLists(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<DealsListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/deal_lists`;
    return ApiService.getRequest(endpoint);
  },

  createDealsList(
    campaignId: string,
    adGroupId: string,
    body: Partial<DealsListSelectionCreateRequest>,
  ): Promise<DataResponse<DealsListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/deal_lists`;
    return ApiService.postRequest(endpoint, body);
  },

  updateDealsList(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<DealsListSelectionResource>,
  ): Promise<DataResponse<DealsListSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/deal_lists/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteDealsList(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/deal_lists/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  },

  // ADEX
  getAdex(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges`;
    return ApiService.getRequest(endpoint);
  },

  createAdex(
    campaignId: string,
    adGroupId: string,
    body: Partial<AdExchangeSelectionCreateRequest>,
  ): Promise<DataResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges`;
    return ApiService.postRequest(endpoint, body);
  },

  updateAdex(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<AdExchangeSelectionResource>,
  ): Promise<DataResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteAdex(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  },

  // ADEX
  getDisplayNetworks(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks`;
    return ApiService.getRequest(endpoint);
  },

  getDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.getRequest(endpoint);
  },

  createDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    body: Partial<DisplayNetworkSelectionCreateRequest>,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks`;
    return ApiService.postRequest(endpoint, body);
  },

  updateDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<DisplayNetworkSelectionResource>,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.putRequest(endpoint, body);
  },

  deleteDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  },

};

export default DisplayCampaignService;
