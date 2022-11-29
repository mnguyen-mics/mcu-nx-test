import {
  CombinedServiceItemsAndConditions,
  ServiceOfferLocaleResource,
  ServiceProviderResource,
  ServiceItemConditionShape,
  ServiceAgreementResource,
  AgreementType,
} from './../models/servicemanagement/PublicServiceItemResource';
import { PaginatedApiParam } from './../utils/ApiHelper';
import { injectable } from 'inversify';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import {
  ServiceCategoryTree,
  ServiceFamily,
  ServiceType,
  ServiceCategoryType,
  ServiceCategorySubType,
  ServiceItemOfferResource,
  ServiceCategoryPublicResource,
  ServiceItemShape,
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

export interface GetServiceItemsOptions extends PaginatedApiParam {
  locale?: Locale;
  parent_categoryi_id?: string;
  label_id?: string;
  audience_segment_id?: string;
  offer_id?: string;
  keywords?: string;
  order_by?: string;
  type?: string[];
}

export interface FindServiceAgreementsOptions extends PaginatedApiParam {
  provider_id?: string;
  service_offer_id?: string;
}

export interface ICatalogService {
  getServices: (
    organisationId: string,
    options: GetServiceOptions,
  ) => Promise<DataListResponse<ServiceItemShape>>;

  getCategoryTree: (
    organisationId: string,
    options: GetServiceOptions,
  ) => Promise<ServiceCategoryTree[]>;

  getCategory: (
    organisationId: string,
    categoryId: string,
  ) => Promise<ServiceCategoryPublicResource>;

  getCategories: (
    organisationId: string,
    options: GetServiceOptions,
  ) => Promise<ServiceCategoryPublicResource[]>;

  getSubscribedServiceItems: (
    customerOrgId: string,
    offerId: string,
    options: GetServiceItemOptions,
  ) => Promise<DataListResponse<ServiceItemShape>>;

  getSubscribedServiceItemConditions: (
    customerOrgId: string,
    offerId: string,
    serviceItemId: string,
    options?: GetServiceItemOptions,
  ) => Promise<DataListResponse<ServiceItemConditionShape>>;

  getService: (serviceId: string) => Promise<DataResponse<ServiceItemShape>>;

  getServiceItems: (
    organisationId: string,
    options: GetServiceItemsOptions,
  ) => Promise<DataListResponse<ServiceItemShape>>;

  getSubscribedOffers: (
    customerOrgId: string,
    options: GetOfferOptions,
  ) => Promise<DataListResponse<ServiceItemOfferResource>>;

  getSubscribedOffer: (
    customerOrgId: string,
    offerId: string,
  ) => Promise<DataResponse<ServiceItemOfferResource>>;

  getAudienceSegmentServices: (
    organisationId: string,
    options: GetServiceOptions,
  ) => Promise<DataListResponse<AudienceSegmentServiceItemPublicResource>>;

  getMyOffers: (options: PaginatedApiParam) => Promise<DataListResponse<ServiceItemOfferResource>>;

  getMyOffer: (
    organisationId: string,
    offerId: string,
  ) => Promise<DataResponse<ServiceItemOfferResource>>;

  getOfferConditions: (
    offerId: string,
    options?: GetServiceItemOptions,
  ) => Promise<DataListResponse<ServiceItemConditionShape>>;

  createServiceOffer: (
    organisationId: string,
    offer: Partial<ServiceItemOfferResource>,
  ) => Promise<DataResponse<ServiceItemOfferResource>>;

  findServiceItem: (serviceItemId: string) => Promise<DataResponse<ServiceItemShape>>;

  createServiceItemCondition: (
    serviceItemId: string,
    serviceItemCondition: Partial<ServiceItemConditionShape>,
  ) => Promise<DataResponse<ServiceItemConditionShape>>;

  addConditionToOffer: (offerId: string, conditionId: string) => Promise<DataResponse<{}>>;

  removeConditionFromOffer: (offerId: string, conditionId: string) => Promise<DataResponse<{}>>;

  deleteServiceItemCondition: (
    serviceItemId: string,
    conditionId: string,
  ) => Promise<DataResponse<{}>>;

  findAvailableServiceItems: () => Promise<DataListResponse<ServiceItemShape>>;

  findAvailableCombinedServiceItemsIds: (
    organisationId: string,
    serviceType?: any,
  ) => Promise<DataListResponse<CombinedServiceItemsAndConditions>>;

  findAvailableServiceProvidersMultiId: (
    organisationId: string,
    serviceProviderIds: number[],
  ) => Promise<DataListResponse<ServiceProviderResource>>;

  findAvailableServiceOffersMultiId: (
    organisationId: string,
    serviceOfferIds: number[],
  ) => Promise<DataListResponse<ServiceOfferLocaleResource>>;

  findAvailableServiceConditionsMultiId: (
    organisationId: string,
    serviceConditionIds: number[],
  ) => Promise<DataListResponse<ServiceItemConditionShape>>;

  findAvailableServiceItemsMultiId: (
    organisationId: string,
    offerIds: number[],
  ) => Promise<DataListResponse<ServiceItemShape>>;

  createServiceAgreement: (
    signingOrganisationId: string,
    agreementType: AgreementType,
  ) => Promise<DataResponse<ServiceAgreementResource>>;

  findServiceAgreements: (
    organisationId: string,
    options: FindServiceAgreementsOptions,
  ) => Promise<DataListResponse<ServiceAgreementResource>>;

  addOfferToAgreement: (
    organisationId: string,
    agreementId: string,
    offerId: string,
  ) => Promise<DataResponse<any>>;

  removeOfferFromAgreement: (
    organisationId: string,
    agreementId: string,
    offerId: string,
  ) => Promise<DataResponse<any>>;

  updateServiceAgreement: (
    organisationId: string,
    agreementId: string,
    body: Partial<ServiceAgreementResource>,
  ) => Promise<DataResponse<any>>;

  deleteServiceAgreement: (
    organisationId: string,
    agreementId: string,
  ) => Promise<DataResponse<any>>;
}

@injectable()
export class CatalogService implements ICatalogService {
  getServices(
    organisationId: string,
    options: GetServiceOptions = {},
  ): Promise<DataListResponse<ServiceItemShape>> {
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
  }

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
  }

  getCategory(organisationId: string, categoryId: string): Promise<ServiceCategoryPublicResource> {
    const endpoint = `subscribed_services/${organisationId}/categories/${categoryId}`;
    return ApiService.getRequest(endpoint).then(
      (res: any) => res.data as ServiceCategoryPublicResource,
    );
  }

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
  }

  getSubscribedServiceItems(
    customerOrgId: string,
    offerId: string,
    options: GetServiceItemOptions = {},
  ): Promise<DataListResponse<ServiceItemShape>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers/${offerId}/service_items`;
    return ApiService.getRequest(endpoint, options);
  }

  getSubscribedServiceItemConditions(
    customerOrgId: string,
    offerId: string,
    serviceItemId: string,
    options: GetServiceItemOptions = {},
  ): Promise<DataListResponse<ServiceItemConditionShape>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers/${offerId}/service_items/${serviceItemId}/service_item_conditions`;
    return ApiService.getRequest(endpoint, options);
  }

  getService(serviceId: string): Promise<DataResponse<ServiceItemShape>> {
    return ApiService.getRequest(`service_items/${serviceId}`);
  }

  getServiceItems(
    organisationId: string,
    options: GetServiceItemsOptions = {},
  ): Promise<DataListResponse<ServiceItemShape>> {
    const emptyTypeOption =
      options.type === undefined || options.type.length === 0
        ? {
            type: ['AUDIENCE_SEGMENT', 'USER_ACCOUNT_COMPARTMENT'],
          }
        : undefined;
    return ApiService.getRequest(`service_items`, {
      organisation_id: organisationId,
      ...options,
      ...emptyTypeOption,
    });
  }

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
  }

  getSubscribedOffer(
    customerOrgId: string,
    offerId: string,
  ): Promise<DataResponse<ServiceItemOfferResource>> {
    const endpoint = `subscribed_services/${customerOrgId}/offers/${offerId}`;
    return ApiService.getRequest(endpoint);
  }

  getAudienceSegmentServices(
    organisationId: string,
    options: GetServiceOptions = {},
  ): Promise<DataListResponse<AudienceSegmentServiceItemPublicResource>> {
    return this.getServices(organisationId, {
      ...options,
      serviceType: ['AUDIENCE_DATA.AUDIENCE_SEGMENT'],
    }) as Promise<DataListResponse<AudienceSegmentServiceItemPublicResource>>;
  }

  getMyOffers(options: PaginatedApiParam): Promise<DataListResponse<ServiceItemOfferResource>> {
    const endpoint = `service_offers`;
    return ApiService.getRequest(endpoint, options);
  }

  getMyOffer(
    organisationId: string,
    offerId: string,
  ): Promise<DataResponse<ServiceItemOfferResource>> {
    const endpoint = `service_offers/${offerId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }

  getOfferConditions(
    offerId: string,
    options: GetServiceItemOptions = {},
  ): Promise<DataListResponse<ServiceItemConditionShape>> {
    const endpoint = `service_offers/${offerId}/service_item_conditions`;
    return ApiService.getRequest(endpoint, options);
  }

  createServiceOffer(
    organisationId: string,
    offer: Partial<ServiceItemOfferResource>,
  ): Promise<DataResponse<ServiceItemOfferResource>> {
    const endpoint = `service_offers?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, { ...offer });
  }

  findServiceItem(serviceItemId: string): Promise<DataResponse<ServiceItemShape>> {
    const endpoint = `service_items/${serviceItemId}`;
    return ApiService.getRequest(endpoint);
  }

  createServiceItemCondition(
    serviceItemId: string,
    serviceItemCondition: Partial<ServiceItemConditionShape>,
  ): Promise<DataResponse<ServiceItemConditionShape>> {
    const endpoint = `service_items/${serviceItemId}/service_item_conditions`;
    return ApiService.postRequest(endpoint, serviceItemCondition);
  }

  addConditionToOffer(offerId: string, conditionId: string): Promise<DataResponse<{}>> {
    const endpoint = `service_offers/${offerId}/service_item_conditions/${conditionId}`;
    return ApiService.putRequest(endpoint, {});
  }

  removeConditionFromOffer(offerId: string, conditionId: string): Promise<DataResponse<{}>> {
    const endpoint = `service_offers/${offerId}/service_item_conditions/${conditionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  deleteServiceItemCondition(
    serviceItemId: string,
    conditionId: string,
  ): Promise<DataResponse<{}>> {
    const endpoint = `service_items/${serviceItemId}/service_item_conditions/${conditionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  findAvailableServiceItems(): Promise<DataListResponse<ServiceItemShape>> {
    const endpoint = `available_service_items`;
    return ApiService.getRequest(endpoint);
  }

  findAvailableCombinedServiceItemsIds(
    organisationId: string,
    serviceType?: any,
  ): Promise<DataListResponse<CombinedServiceItemsAndConditions>> {
    const endpoint = `organisations/${organisationId}/available_combined_service_items_and_conditions`;
    return ApiService.getRequest(endpoint, serviceType);
  }

  findAvailableServiceProvidersMultiId(
    organisationId: string,
    serviceProviderIds: number[],
  ): Promise<DataListResponse<ServiceProviderResource>> {
    const serviceProviderIdsStr = serviceProviderIds.join(',');
    const endpoint = `organisations/${organisationId}/available_service_providers?id=${serviceProviderIdsStr}`;
    return ApiService.getRequest(endpoint);
  }

  findAvailableServiceOffersMultiId(
    organisationId: string,
    serviceOfferIds: number[],
  ): Promise<DataListResponse<ServiceOfferLocaleResource>> {
    const serviceOfferIdsStr = serviceOfferIds.join(',');
    const endpoint = `organisations/${organisationId}/available_service_offers?service_item_offer_id=${serviceOfferIdsStr}`;
    return ApiService.getRequest(endpoint);
  }

  findAvailableServiceConditionsMultiId(
    organisationId: string,
    serviceConditionIds: number[],
  ): Promise<DataListResponse<ServiceItemConditionShape>> {
    const serviceConditionIdsStr = serviceConditionIds.join(',');
    const endpoint = `organisations/${organisationId}/available_service_items_conditions?service_item_offer_id=${serviceConditionIdsStr}`;
    return ApiService.getRequest(endpoint);
  }

  findAvailableServiceItemsMultiId(
    organisationId: string,
    offerIds: number[],
  ): Promise<DataListResponse<ServiceItemShape>> {
    const offerIdsStr = offerIds.join(',');
    const endpoint = `organisations/${organisationId}/available_service_items?offer_id=${offerIdsStr}`;
    return ApiService.getRequest(endpoint);
  }

  findServiceAgreements(
    organisationId: string,
    options: FindServiceAgreementsOptions,
  ): Promise<DataListResponse<ServiceAgreementResource>> {
    const endpoint = `organisations/${organisationId}/agreements`;
    return ApiService.getRequest(endpoint, options);
  }

  createServiceAgreement(
    signingOrganisationId: string,
    agreementType: AgreementType,
  ): Promise<DataResponse<ServiceAgreementResource>> {
    const endpoint = `organisations/${signingOrganisationId}/agreements`;
    const body: Partial<ServiceAgreementResource> = {
      signing_organisation_id: signingOrganisationId,
      agreement_type: agreementType,
      debited_account_id: signingOrganisationId,
    };

    return ApiService.postRequest(endpoint, body);
  }

  addOfferToAgreement(
    organisationId: string,
    agreementId: string,
    offerId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `organisations/${organisationId}/agreements/${agreementId}/offers/${offerId}`;
    return ApiService.putRequest(endpoint, {});
  }

  removeOfferFromAgreement(
    organisationId: string,
    agreementId: string,
    offerId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `organisations/${organisationId}/agreements/${agreementId}/offers/${offerId}`;
    return ApiService.deleteRequest(endpoint);
  }

  updateServiceAgreement(
    organisationId: string,
    agreementId: string,
    body: Partial<ServiceAgreementResource>,
  ): Promise<DataResponse<any>> {
    const endpoint = `organisations/${organisationId}/agreements/${agreementId}`;
    const updateBody: Partial<ServiceAgreementResource> = {
      id: agreementId,
      signing_organisation_id: organisationId,
      ...body,
    };

    return ApiService.putRequest(endpoint, updateBody);
  }

  deleteServiceAgreement(organisationId: string, agreementId: string): Promise<DataResponse<any>> {
    const endpoint = `organisations/${organisationId}/agreements/${agreementId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
