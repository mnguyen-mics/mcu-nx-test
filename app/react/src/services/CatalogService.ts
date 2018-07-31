// import { ServiceItemConditionsShape } from './../models/servicemanagement/PublicServiceItemResource';
import { PaginatedApiParam } from './../utils/ApiHelper';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  ServiceCategoryTree,
  ServiceFamily,
  ServiceType,
  ServiceCategoryType,
  ServiceCategorySubType,
  ServiceItemOfferResource,
  ServiceCategoryPublicResource,
  ServiceItemPublicResource,
  AudienceSegmentServiceItemPublicResource,
} from '../models/servicemanagement/PublicServiceItemResource';
import { Locale } from '../models/Locale';

export interface GetOfferOptions extends PaginatedApiParam {
  serviceAgreementId?: string;
  keywords?: string;
}

interface GetServiceItemOptions extends PaginatedApiParam {
  orderBy?: string;
  keywords?: string;
  locale?: Locale;
}

export interface GetServiceOptions extends PaginatedApiParam {
  root?: boolean;
  parentCategoryId?: string;
  serviceFamily?: ServiceFamily[];
  serviceType?: ServiceType[];
  locale?: Locale;
  categoryType?: ServiceCategoryType[];
  categorySubtype?: ServiceCategorySubType[];
  searchDepth?: number;
  keywords?: string;
}

const CatalogService = {
  getServices(
    organisationId: string,
    options: GetServiceOptions = {},
  ): Promise<DataListResponse<ServiceItemPublicResource>> {
    const endpoint = `subscribed_services/${organisationId}/services`;
    const params = {
      ...options,
      root: options.root,
      parent_category_id: options.parentCategoryId,
      service_family: options.serviceFamily,
      service_type: options.serviceType,
      locale: options.locale,
      category_type: options.categoryType,
      category_subtype: options.categorySubtype,
    };
    return ApiService.getRequest(endpoint, params);
  },
  
  getCategoryTree(
    organisationId: string,
    options: GetServiceOptions = {},
  ): Promise<ServiceCategoryTree[]> {
    const endpoint = `subscribed_services/${organisationId}/category_trees`;
    const params = {
      service_family: options.serviceFamily,
      service_type: options.serviceType,
      locale: options.locale,
      category_type: options.categoryType,
      category_subtype: options.categorySubtype,
    };
    return ApiService.getRequest(endpoint, params).then(
      (res: any) => res.data as ServiceCategoryTree[],
    );
  },

  getCategory(
    organisationId: string,
    categoryId: string,
  ): Promise<ServiceCategoryPublicResource> {
    const endpoint = `subscribed_services/${organisationId}/categories/${categoryId}`;
    return ApiService.getRequest(endpoint).then(
      (res: any) => res.data as ServiceCategoryPublicResource,
    );
  },

  getCategories(
    organisationId: string,
    options: GetServiceOptions = {},
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
    return ApiService.getRequest(endpoint, params).then(
      (res: any) => res.data as ServiceCategoryPublicResource[],
    );
  },

  getSubscribedServiceItems(
    customerOrgId: string,
    offerId: string,
    options: GetServiceItemOptions = {}
  ): Promise<DataListResponse<ServiceItemPublicResource>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers/${offerId}/service_items`;
    const params = {
      ...options
    };
    return ApiService.getRequest(endpoint, params);
  },

  getService(
    serviceId: string,
  ): Promise<DataResponse<ServiceItemPublicResource>> {
    return ApiService.getRequest(`service_items/${serviceId}`);
  },

  getSubscribedOffers(
    customerOrgId: string,
    options: GetOfferOptions,
  ): Promise<DataListResponse<ServiceItemOfferResource>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers`;
    const params = {
      ...options,
      service_agreement_id: options.serviceAgreementId,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getSubscribedOffer(
    customerOrgId: string,
    offerId: string,
  ): Promise<DataListResponse<ServiceItemOfferResource>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers/${offerId}`;
    return ApiService.getRequest(endpoint);
  },

  getAudienceSegmentServices(
    organisationId: string,
    options: GetServiceOptions = {},
  ): Promise<DataListResponse<AudienceSegmentServiceItemPublicResource>> {
    return CatalogService.getServices(organisationId, {
      ...options,
      serviceType: ['AUDIENCE_DATA.AUDIENCE_SEGMENT'],
    }) as Promise<DataListResponse<AudienceSegmentServiceItemPublicResource>>;
  },

};

export default CatalogService;
