import { InventorySourceResource } from './../models/campaign/display/InventorySourceResource';
import { AdGroupResource } from './../models/campaign/display/AdGroupResource';
import { DisplayCampaignResource } from './../models/campaign/display/DisplayCampaignResource';
import { DisplayCampaignInfoResource } from './../models/campaign/display/DisplayCampaignInfoResource';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { injectable } from 'inversify';
import { AudienceSegmentSelectionResource } from '../models/audiencesegment';
import { AdResource, AdCreateRequest } from '../models/campaign/display/AdResource';
import { GoalSelectionResource } from '../models/goal/GoalSelectionResource';
import {
  LocationSelectionResource,
  LocationSelectionCreateRequest,
} from '../containers/Campaigns/Display/Edit/AdGroup/sections/Location/domain';
import { GoalSelectionCreateRequest } from '../models/goal/index';
import {
  AdExchangeSelectionCreateRequest,
  AdExchangeSelectionResource,
} from '../models/adexchange/adexchange';
import {
  DisplayNetworkSelectionCreateRequest,
  DisplayNetworkSelectionResource,
} from '../models/displayNetworks/displayNetworks';
import { CampaignStatus } from '../models/campaign/constants';
import { PaginatedApiParam } from '../utils/ApiHelper';

export interface CampaignsOptions extends PaginatedApiParam {
  administration_id?: string;
  scope?: string;
  keywords?: string;
  status?: CampaignStatus[];
  archived?: boolean;
  label_id?: string[];
  order_by?: string[];
  automated?: boolean;
}

export interface AdGroupOptions extends PaginatedApiParam {
  keywords?: string;
}

export interface IDisplayCampaignService {
  getCampaignDisplay: (campaignId: string) => Promise<DataResponse<DisplayCampaignResource>>;

  getCampaignDisplayViewDeep: (
    campaignId: string,
    params?: object,
  ) => Promise<DataResponse<DisplayCampaignInfoResource>>;

  getCampaignName: (campaignId: string) => Promise<string>;

  createCampaign: (
    body: Partial<DisplayCampaignResource>,
  ) => Promise<DataResponse<DisplayCampaignResource>>;

  updateCampaign: (
    campaignId: string,
    body: Partial<DisplayCampaignResource>,
  ) => Promise<DataResponse<DisplayCampaignResource>>;

  deleteCampaign: (campaignId: string) => Promise<any>;

  /* AD GROUP SERVICES */
  getAdGroup: (campaignId: string, adGroupId: string) => Promise<DataResponse<AdGroupResource>>;

  getAdGroups: (campaignId: string) => Promise<DataListResponse<AdGroupResource>>;

  findAdGroups: (
    organisationId: string,
    adGroupOptions: AdGroupOptions,
  ) => Promise<DataListResponse<AdGroupResource>>;

  createAdGroup: (campaignId: string, body: object) => Promise<DataResponse<AdGroupResource>>;

  updateAdGroup: (
    campaignId: string,
    adGroupId: string,
    body: object,
  ) => Promise<DataResponse<AdGroupResource>>;

  deleteAdGroup: (campaignId: string, adGroupId: string) => Promise<AdGroupResource>;

  /* AUDIENCE SERVICES */
  getAudienceSegments: (
    campaignId: string,
    adGroupId: string,
  ) => Promise<DataListResponse<AudienceSegmentSelectionResource>>;

  // TODO delete, use getAudienceSegments instead
  getAudiences: (campaignId: string, adGroupId: string) => any; // type

  createAudienceSegment: (
    campaignId: string,
    adGroupId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ) => Promise<DataResponse<AudienceSegmentSelectionResource>>;

  updateAudienceSegment: (
    campaignId: string,
    adGroupId: string,
    audienceSegmentId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ) => Promise<DataResponse<AudienceSegmentSelectionResource>>;

  deleteAudienceSegment: (campaignId: string, adGroupId: string, id: string) => Promise<any>;

  /* PUBLISHER SERVICES */
  getPublishers: (campaignId: string) => Promise<InventorySourceResource[]>;
  createPublisher: (campaignId: string, body: object) => Promise<InventorySourceResource>;

  deletePublisher: (campaignId: string, id: string) => Promise<InventorySourceResource>;

  /* AD SERVICES */
  getAd: (campaignId: string, adGroupId: string, adId: string) => Promise<DataResponse<AdResource>>;

  getAds: (campaignId: string, adGroupId: string) => Promise<DataListResponse<AdResource>>;

  updateAd: (
    adId: string,
    campaignId: string,
    adGroupId: string,
    body: object,
  ) => Promise<DataResponse<AdResource>>;

  createAd: (campaignId: string, adGroupId: string, body: AdCreateRequest) => Promise<AdResource>;

  deleteAd: (campaignId: string, adGroupId: string, id: string) => Promise<any>;

  /* GOAL SERVICES */
  getGoals: (campaignId: string) => Promise<DataListResponse<GoalSelectionResource>>;

  createGoal: (
    campaignId: string,
    body: GoalSelectionCreateRequest,
  ) => Promise<GoalSelectionResource>;

  updateGoal: (
    campaignId: string,
    id: string,
    body: Partial<GoalSelectionCreateRequest>,
  ) => Promise<GoalSelectionResource>;

  deleteGoal: (campaignId: string, id: string) => Promise<any>;

  /* LOCATION SERVICES */

  createLocation: (
    campaignId: string,
    adGroupId: string,
    body: Partial<LocationSelectionCreateRequest>,
  ) => Promise<DataResponse<LocationSelectionResource>>;

  deleteLocation: (campaignId: string, adGroupId: string, id: string) => Promise<any>;
  getLocations: (
    campaignId: string,
    adGroupId: string,
  ) => Promise<DataListResponse<LocationSelectionResource>>;
  updateLocation: (
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<LocationSelectionCreateRequest>,
  ) => Promise<DataResponse<LocationSelectionResource>>;

  // ADEX
  getAdex: (
    campaignId: string,
    adGroupId: string,
  ) => Promise<DataListResponse<AdExchangeSelectionResource>>;

  createAdex: (
    campaignId: string,
    adGroupId: string,
    body: Partial<AdExchangeSelectionCreateRequest>,
  ) => Promise<DataResponse<AdExchangeSelectionResource>>;

  updateAdex: (
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<AdExchangeSelectionResource>,
  ) => Promise<DataResponse<AdExchangeSelectionResource>>;

  deleteAdex: (campaignId: string, adGroupId: string, id: string) => Promise<any>;

  // ADEX
  getDisplayNetworks: (
    campaignId: string,
    adGroupId: string,
  ) => Promise<DataListResponse<DisplayNetworkSelectionResource>>;

  getDisplayNetwork: (
    campaignId: string,
    adGroupId: string,
    id: string,
  ) => Promise<DataResponse<DisplayNetworkSelectionResource>>;

  createDisplayNetwork: (
    campaignId: string,
    adGroupId: string,
    body: Partial<DisplayNetworkSelectionCreateRequest>,
  ) => Promise<DataResponse<DisplayNetworkSelectionResource>>;

  updateDisplayNetwork: (
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<DisplayNetworkSelectionResource>,
  ) => Promise<DataResponse<DisplayNetworkSelectionResource>>;

  deleteDisplayNetwork: (campaignId: string, adGroupId: string, id: string) => Promise<any>;

  getDisplayCampaigns: (
    organisationId: string,
    campaignType: 'DISPLAY',
    options: CampaignsOptions,
  ) => Promise<DataListResponse<DisplayCampaignResource>>;
}

@injectable()
export class DisplayCampaignService implements IDisplayCampaignService {
  /* CAMPAIGN SERVICES */
  getCampaignDisplay(campaignId: string): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.getRequest(endpoint);
  }

  getDisplayCampaigns(
    organisationId: string,
    campaignType: 'DISPLAY',
    options: CampaignsOptions = {},
  ): Promise<DataListResponse<DisplayCampaignResource>> {
    const endpoint = 'campaigns';

    const params = {
      organisation_id: organisationId,
      campaign_type: campaignType,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getCampaignDisplayViewDeep(
    campaignId: string,
    params: object = {},
  ): Promise<DataResponse<DisplayCampaignInfoResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.getRequest(endpoint, params);
  }

  getCampaignName(campaignId: string): Promise<string> {
    return this.getCampaignDisplay(campaignId).then(
      (res: DataResponse<DisplayCampaignResource>) => res.data.name,
    );
  }

  createCampaign(
    body: Partial<DisplayCampaignResource>,
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns`;
    return ApiService.postRequest(endpoint, { ...body, type: 'DISPLAY' });
  }

  updateCampaign(
    campaignId: string,
    body: Partial<DisplayCampaignResource>,
  ): Promise<DataResponse<DisplayCampaignResource>> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.putRequest(endpoint, { ...body, type: 'DISPLAY' });
  }

  deleteCampaign(campaignId: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* AD GROUP SERVICES */
  getAdGroup(campaignId: string, adGroupId: string): Promise<DataResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.getRequest(endpoint);
  }

  getAdGroups(campaignId: string): Promise<DataListResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.getRequest(endpoint);
  }

  findAdGroups(
    organisationId: string,
    options: AdGroupOptions,
  ): Promise<DataListResponse<AdGroupResource>> {
    const endpoint = `display_campaigns.ad_groups`;
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  createAdGroup(campaignId: string, body: object): Promise<DataResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups`;
    return ApiService.postRequest(endpoint, body);
  }

  updateAdGroup(
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<DataResponse<AdGroupResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAdGroup(campaignId: string, adGroupId: string): Promise<AdGroupResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* AUDIENCE SERVICES */
  getAudienceSegments(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.getRequest(endpoint);
  }

  // TODO delete, use getAudienceSegments instead
  getAudiences(campaignId: string, adGroupId: string) {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.getRequest(endpoint).then((res: any) =>
      res.data.map((segment: any) => {
        const { audience_segment_id, exclude, id, technical_name, ...relevantData } = segment;

        // code smell...
        return {
          ...relevantData,
          id: audience_segment_id,
          include: !exclude,
          modelId: id,
          toBeRemoved: false,
        };
      }),
    );
  }

  createAudienceSegment(
    campaignId: string,
    adGroupId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ): Promise<DataResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments`;
    return ApiService.postRequest(endpoint, body);
  }

  updateAudienceSegment(
    campaignId: string,
    adGroupId: string,
    audienceSegmentId: string,
    body: Partial<AudienceSegmentSelectionResource>,
  ): Promise<DataResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${audienceSegmentId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceSegment(campaignId: string, adGroupId: string, id: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/audience_segments/${id}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* PUBLISHER SERVICES */
  getPublishers(campaignId: string): Promise<InventorySourceResource[]> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources`;
    return ApiService.getRequest(endpoint).then((res: DataResponse<InventorySourceResource[]>) =>
      res.data.map((elem: InventorySourceResource) => {
        const { display_network_access_id, id, ...publisher } = elem;

        return {
          ...publisher,
          display_network_access_id,
          id: display_network_access_id,
          modelId: id,
          toBeRemoved: false,
        };
      }),
    );
  }
  createPublisher(campaignId: string, body: object): Promise<InventorySourceResource> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources/`;
    return ApiService.postRequest(endpoint, body);
  }

  deletePublisher(campaignId: string, id: string): Promise<InventorySourceResource> {
    const endpoint = `display_campaigns/${campaignId}/inventory_sources/${id}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* AD SERVICES */
  getAd(campaignId: string, adGroupId: string, adId: string): Promise<DataResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
    return ApiService.getRequest(endpoint);
  }

  getAds(campaignId: string, adGroupId: string): Promise<DataListResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
    return ApiService.getRequest(endpoint);
  }

  updateAd(
    adId: string,
    campaignId: string,
    adGroupId: string,
    body: object,
  ): Promise<DataResponse<AdResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${adId}`;
    return ApiService.putRequest(endpoint, body);
  }

  createAd(campaignId: string, adGroupId: string, body: AdCreateRequest): Promise<AdResource> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads`;
    return ApiService.postRequest(endpoint, body);
  }

  deleteAd(campaignId: string, adGroupId: string, id: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ads/${id}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* GOAL SERVICES */
  getGoals(campaignId: string): Promise<DataListResponse<GoalSelectionResource>> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.getRequest(endpoint);
  }

  createGoal(campaignId: string, body: GoalSelectionCreateRequest): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections`;
    return ApiService.postRequest(endpoint, body);
  }

  updateGoal(
    campaignId: string,
    id: string,
    body: Partial<GoalSelectionCreateRequest>,
  ): Promise<GoalSelectionResource> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteGoal(campaignId: string, id: string): Promise<any> {
    const endpoint = `campaigns/${campaignId}/goal_selections/${id}`;
    return ApiService.deleteRequest(endpoint);
  }

  /* LOCATION SERVICES */

  createLocation(
    campaignId: string,
    adGroupId: string,
    body: Partial<LocationSelectionCreateRequest>,
  ): Promise<DataResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.postRequest(endpoint, body);
  }

  deleteLocation(campaignId: string, adGroupId: string, id: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.deleteRequest(endpoint);
  }
  getLocations(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations`;
    return ApiService.getRequest(endpoint);
  }
  updateLocation(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<LocationSelectionCreateRequest>,
  ): Promise<DataResponse<LocationSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/locations/${id}`;
    return ApiService.putRequest(endpoint, body);
  }

  // ADEX
  getAdex(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges`;
    return ApiService.getRequest(endpoint);
  }

  createAdex(
    campaignId: string,
    adGroupId: string,
    body: Partial<AdExchangeSelectionCreateRequest>,
  ): Promise<DataResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges`;
    return ApiService.postRequest(endpoint, body);
  }

  updateAdex(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<AdExchangeSelectionResource>,
  ): Promise<DataResponse<AdExchangeSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges/${id}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAdex(campaignId: string, adGroupId: string, id: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/ad_exchanges/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  }

  // ADEX
  getDisplayNetworks(
    campaignId: string,
    adGroupId: string,
  ): Promise<DataListResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks`;
    return ApiService.getRequest(endpoint);
  }

  getDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    id: string,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.getRequest(endpoint);
  }

  createDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    body: Partial<DisplayNetworkSelectionCreateRequest>,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks`;
    return ApiService.postRequest(endpoint, body);
  }

  updateDisplayNetwork(
    campaignId: string,
    adGroupId: string,
    id: string,
    body: Partial<DisplayNetworkSelectionResource>,
  ): Promise<DataResponse<DisplayNetworkSelectionResource>> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteDisplayNetwork(campaignId: string, adGroupId: string, id: string): Promise<any> {
    const endpoint = `display_campaigns/${campaignId}/ad_groups/${adGroupId}/display_networks/${id}`;
    return ApiService.deleteRequest(endpoint, {});
  }
}
