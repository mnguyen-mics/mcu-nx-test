import { Locale } from '../Locale';

export type ServiceFamily = 'AUDIENCE_DATA' | 'DISPLAY_CAMPAIGN';
export type ServiceType =
  | 'AUDIENCE_DATA.AUDIENCE_SEGMENT'
  | 'AUDIENCE_DATA.USER_DATA_TYPE'
  | 'DISPLAY_CAMPAIGN.ADEX_INVENTORY'
  | 'DISPLAY_CAMPAIGN.REAL_TIME_BIDDING'
  | 'DISPLAY_CAMPAIGN.VISIBILITY'
  | 'DISPLAY_CAMPAIGN.INVENTORY_ACCESS'
  | 'DISPLAY_CAMPAIGN.AD_EXCHANGE_HUB_INVENTORY'
  | 'DISPLAY_CAMPAIGN.DISPLAY_NETWORK_INVENTORY';
export type ServiceCategoryType = 'AUDIENCE';
export type ServiceCategorySubType = 'AUDIENCE.AGE' | 'AUDIENCE.GENDER';

export interface ServiceItemPublicResource {
  id: string;
  locale: Locale;
  name: string;
  description?: string;
  provider_id?: string;
  category_id?: string;
  list_weight?: number;
  reseller_agreement_id?: string;
  type?: string;
  display_network_id?: string;
  inventory_access_type?: string;
}

export interface AudienceSegmentServiceItemPublicResource
  extends ServiceItemPublicResource {
  type: 'audience_segment';
  segment_id: string;
  datamart_id: string;
}

export interface DisplayNetworkServiceItemPublicResource
  extends ServiceItemPublicResource {
  type: 'inventory_access_display_network';
  display_network_id: string;
}

export interface PlacementListServiceItemPublicResource
  extends ServiceItemPublicResource {
  type: 'inventory_access_placement_list';
  placement_list_id: string;
}

export interface DealListServiceItemPublicResource
  extends ServiceItemPublicResource {
  type: 'inventory_access_deal_list';
  deal_list_id: string;
}

export interface AdexInventoryServiceItemPublicResource
  extends ServiceItemPublicResource {
  type: 'inventory_access_ad_exchange';
  ad_exchange_id: string;
}

export interface BaseServiceItemPublicResource
  extends ServiceItemPublicResource {
  service_type: string;
}

export interface AdExchangeHubInventoryServiceItemPublicResource
  extends ServiceItemPublicResource {
    ad_exchange_hub_key: string;
}

export interface KeywordListInventoryAccessPublicResource
  extends ServiceItemPublicResource {
    keyword_list_id: string;
}

export type ServiceItemShape =
  | AudienceSegmentServiceItemPublicResource
  | DisplayNetworkServiceItemPublicResource
  | PlacementListServiceItemPublicResource
  | DealListServiceItemPublicResource
  | AdexInventoryServiceItemPublicResource
  | AdExchangeHubInventoryServiceItemPublicResource
  | BaseServiceItemPublicResource
  | KeywordListInventoryAccessPublicResource;

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

export interface ServiceItemOfferResource {
  id: string;
  name: string;
  custom: boolean;
  credited_account_id: string;
  credited_account_name?: string;
  provider_id: string;
  provider_name?: string;
  offer_type: string;
}

export type ServiceItemConditionsShape =
  | LinearServiceItemConditionsResource
  | PluginServiceItemConditionsResource
  | ProvidedServiceItemConditionsResource;

interface ServiceItemConditionsResource {
  id: string;
  service_item_id: string;
}

interface LinearServiceItemConditionsResource
  extends ServiceItemConditionsResource {
  currency: string;
  percent_value: number;
  fixed_value: number;
  min_value: number;
}

interface PluginServiceItemConditionsResource
  extends ServiceItemConditionsResource {
  valuator_id: string;
}

interface ProvidedServiceItemConditionsResource
  extends ServiceItemConditionsResource {}

export interface ServiceAgreement {
  id: string;
  version: string;
  offers: ServiceItemOfferResource[];
}

export function isLinearServiceItemConditionsResource(
  serviceItemCondition: ServiceItemConditionsShape,
): serviceItemCondition is LinearServiceItemConditionsResource {
  return (
    (serviceItemCondition as LinearServiceItemConditionsResource)
      .percent_value !== undefined &&
    (serviceItemCondition as LinearServiceItemConditionsResource)
      .fixed_value !== undefined
  );
}
