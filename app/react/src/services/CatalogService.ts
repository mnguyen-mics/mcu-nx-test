import ApiService from './ApiService';
import {
  ServiceCategoryTree,
  ServiceFamily,
  ServiceType,
  ServiceCategoryType,
  ServiceCategorySubType,
  ServiceCategoryPublicResource,
  ServiceItemPublicResource,
} from '../models/servicemanagement/PublicServiceItemResource';
import { Locale } from '../models/Locale';

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
