import ApiService from './ApiService';

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
export type Locale = 'en_US' | 'fr_FR';

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

const CatalogService = {

  getCategoryTree(
    organisationId: string,
    options: {
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
    } = {},
  ): Promise<ServiceCategoryTree[]> {
    const endpoint = `subscribed_services/${organisationId}/category_trees`;
    const params = {
      service_family: options.serviceFamily,
      service_type: options.serviceType,
      locale: options.locale,
      category_type: options.categoryType,
      category_subtype: options.categorySubtype,
    };
    return ApiService.getRequest(endpoint, params).then(res => res.data as ServiceCategoryTree[]);
  },

  getCategory(
    organisationId: string,
    categoryId: string,
  ): Promise<ServiceCategoryPublicResource> {
    const endpoint = `subscribed_services/${organisationId}/categories/${categoryId}`;
    return ApiService.getRequest(endpoint).then(res => res.data as ServiceCategoryPublicResource);
  },

  getCategories(
    organisationId: string,
    options: {
      root?: boolean,
      parentCategoryId?: string,
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
    } = {},
  ): Promise<ServiceCategoryPublicResource[]> {
    const endpoint = `subscribed_services/${organisationId}/categories`;
    const params = {
      root: options.root,
      parent_category_id: options.parentCategoryId,
      service_family: options.serviceFamily,
      service_type: options.serviceType,
      locale: options.locale,
      category_type: options.categoryType,
      category_subtype: options.categorySubtype,
    };
    return ApiService.getRequest(endpoint, params).then(res => res.data as ServiceCategoryPublicResource[]);
  },

  getServices(
    organisationId: string,
    options: {
      root?: boolean,
      parentCategoryId?: string,
      serviceFamily?: ServiceFamily[],
      serviceType?: ServiceType[],
      locale?: Locale,
      categoryType?: ServiceCategoryType[],
      categorySubtype?: ServiceCategorySubType[],
      searchDepth?: number,
    } = {},
  ): Promise<ServiceItemPublicResource[]> {
    const endpoint = `subscribed_services/${organisationId}/services`;
    const params = {
      root: options.root,
      parent_category_id: options.parentCategoryId,
      service_family: options.serviceFamily,
      service_type: options.serviceType,
      locale: options.locale,
      category_type: options.categoryType,
      category_subtype: options.categorySubtype,
    };
    return ApiService.getRequest(endpoint, params).then(res => res.data as ServiceItemPublicResource[]);
  },

};

export default CatalogService;
