import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import {
  DeviceIdRegistryResource,
  DeviceIdRegistryOfferResource,
  DeviceIdRegistryDatamartSelectionResource,
} from '../models/deviceIdRegistry/DeviceIdRegistryResource';

export interface IDeviceIdRegistryService {
  getDeviceIdRegistries: (
    communityId: string,
    options?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryResource>>;

  createDeviceIdRegistry: (
    body: Partial<DeviceIdRegistryResource>,
  ) => Promise<DataResponse<DeviceIdRegistryResource>>;

  createDeviceIdRegistryDatamartSelection: (
    datamartId: string,
    deviceIdRegistryId: string,
    options?: object,
  ) => Promise<DataResponse<DeviceIdRegistryDatamartSelectionResource>>;

  getDeviceIdRegistryOffers: (
    options?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryOfferResource>>;

  getSubscribedDeviceIdRegistryOffers: (
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryOfferResource>>;
}

@injectable()
export default class DeviceIdRegistryService implements IDeviceIdRegistryService {
  getDeviceIdRegistries(
    communityId: string,
    options: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryResource>> {
    const endpoint = 'device_id_registries';
    const params = {
      community_id: communityId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  createDeviceIdRegistry(
    body: DeviceIdRegistryResource,
  ): Promise<DataResponse<DeviceIdRegistryResource>> {
    const endpoint = 'device_id_registries';
    return ApiService.postRequest(endpoint, body);
  }

  createDeviceIdRegistryDatamartSelection(
    datamartId: string,
    deviceIdRegistryId: string,
  ): Promise<DataResponse<DeviceIdRegistryDatamartSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/device_id_registries`;
    const body: Partial<DeviceIdRegistryDatamartSelectionResource> = {
      device_id_registry_id: deviceIdRegistryId,
      datamart_id: datamartId,
    };
    return ApiService.postRequest(endpoint, body);
  }

  getDeviceIdRegistryOffers(
    options: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryOfferResource>> {
    const endpoint = 'device_technical_id_registry_service_offers';
    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getSubscribedDeviceIdRegistryOffers(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryOfferResource>> {
    const endpoint = 'device_technical_id_registry_service_offers';
    const params = {
      subscriber_id: organisationId,
      signed_agreement_filter: true,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }
}
