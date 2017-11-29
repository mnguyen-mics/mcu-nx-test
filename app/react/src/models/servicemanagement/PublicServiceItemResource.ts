import { Locale } from '../Locale';

export type ServiceFamily = 'AUDIENCE_DATA' | 'DISPLAY_CAMPAIGN';
export type ServiceType =
  'AUDIENCE_DATA.AUDIENCE_SEGMENT' |
  'AUDIENCE_DATA.USER_DATA_TYPE' |
  'DISPLAY_CAMPAIGN.ADEX_INVENTORY' |
  'DISPLAY_CAMPAIGN.REAL_TIME_BIDDING' |
  'DISPLAY_CAMPAIGN.VISIBILITY';
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
  service_type?: ServiceType;
  [key: string]: any;
}

export interface AudienceSegmentServiceItemPublicResource extends ServiceItemPublicResource {
  segment_id: string;
  datamart_id: string;
}

export interface AdexInventoryServiceItemPublicResource extends ServiceItemPublicResource {
  ad_exchange_hub_key: string;
}

export type ServiceItemShape = AudienceSegmentServiceItemPublicResource | AdexInventoryServiceItemPublicResource;

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
