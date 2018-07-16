import { Locale } from '../Locale';

export type ServiceFamily = 'AUDIENCE_DATA' | 'DISPLAY_CAMPAIGN';
export type ServiceType =
  'AUDIENCE_DATA.AUDIENCE_SEGMENT' |
  'AUDIENCE_DATA.USER_DATA_TYPE' |
  'DISPLAY_CAMPAIGN.ADEX_INVENTORY' |
  'DISPLAY_CAMPAIGN.REAL_TIME_BIDDING' |
  'DISPLAY_CAMPAIGN.VISIBILITY' |
  'DISPLAY_CAMPAIGN.INVENTORY_ACCESS' |
  'DISPLAY_CAMPAIGN.AD_EXCHANGE_HUB_INVENTORY' |
  'DISPLAY_CAMPAIGN.DISPLAY_NETWORK_INVENTORY';
export type ServiceCategoryType =
  'AUDIENCE';
export type ServiceCategorySubType =
  'AUDIENCE.AGE' |
  'AUDIENCE.GENDER';

export interface ServiceItemPublicResource {
  id: string;
  locale: Locale;
  name: string;
  description?: string;
  provider_id?: string;
  category_id?: string;
  list_weight?: number;
  reseller_agreement_id?: string;
  type : string;
}

export interface AudienceSegmentServiceItemPublicResource extends ServiceItemPublicResource {
  type: 'audience_segment';
  segment_id: string;
  datamart_id: string;
}

export interface DisplayNetworkServiceItemPublicResource extends ServiceItemPublicResource {
  type: 'inventory_access_display_network';
  display_network_id: string;
}

export interface PlacementListServiceItemPublicResource extends ServiceItemPublicResource {
  type: 'inventory_access_placement_list';
  placement_list_id: string;
}

export interface DealListServiceItemPublicResource extends ServiceItemPublicResource {
  type: 'inventory_access_deal_list';
  deal_list_id: string;
}

export interface AdexInventoryServiceItemPublicResource extends ServiceItemPublicResource {
  type: 'inventory_access_ad_exchange';
  ad_exchange_id: string;
}

export type ServiceItemShape = AudienceSegmentServiceItemPublicResource;

export interface ServiceCategoryPublicResource {
  id: string;
  locale: Locale;
  name: string;
  description?: string;
  provider_id?: string;
  parent_category_id?: string;
  category_subtype?: ServiceCategorySubType;
  list_weight?: number;
}

export interface ServiceCategoryTree {
  node: ServiceCategoryPublicResource;
  children: ServiceCategoryTree[];
  services?: ServiceCategoryPublicResource[];
}
