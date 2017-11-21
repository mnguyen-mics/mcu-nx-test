import { camelizeKeys, decamelizeKeys } from 'humps';
import ApiService, { DataResponse, DataListResponse } from './ApiService';

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
  providerId?: string;
  categoryId?: string;
  listWeight?: number;
  serviceType?: ServiceType;
  [key: string]: any;
}

export interface AudienceSegmentServiceItemPublicResource extends ServiceItemPublicResource {
  segmentId: string;
  datamartId: string;
}

export interface AdexInventoryServiceItemPublicResource extends ServiceItemPublicResource {
  adExchangeHubKey: string;
}

export type ServiceItemShape = AudienceSegmentServiceItemPublicResource | AdexInventoryServiceItemPublicResource;

export interface ServiceCategoryPublicResource {
  id: string;
  locale: Locale;
  name: string;
  description?: string;
  providerId?: string;
  parentCategoryId?: string;
  categorySubtype?: ServiceCategorySubType;
  listWeight?: number;
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
    const params = decamelizeKeys(options);
    return ApiService.getRequest(endpoint, params)
    .then((res: DataListResponse<ServiceCategoryTree>) => {
      return camelizeKeys(res.data) as ServiceCategoryTree[];
    });
  },

  getCategory(
    organisationId: string,
    categoryId: string,
  ): Promise<ServiceCategoryPublicResource> {
    const endpoint = `subscribed_services/${organisationId}/categories/${categoryId}`;
    return ApiService.getRequest(endpoint)
    .then((res: DataResponse<ServiceCategoryPublicResource>) => {
      return camelizeKeys(res.data) as ServiceCategoryPublicResource;
    });
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
    const params = decamelizeKeys(options);
    return ApiService.getRequest(endpoint, params)
    .then((res: DataListResponse<ServiceCategoryPublicResource>) => {
      return camelizeKeys(res.data) as ServiceCategoryPublicResource[];
    });
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
    const params = decamelizeKeys(options);
    return ApiService.getRequest(endpoint, params)
    .then((res: DataListResponse<ServiceItemPublicResource>) => {
      return camelizeKeys(res.data) as ServiceItemPublicResource[];
    });
  },

};

export default CatalogService;
