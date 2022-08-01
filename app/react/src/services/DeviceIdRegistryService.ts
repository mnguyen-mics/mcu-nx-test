import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import {
  DeviceIdRegistryResource,
  DeviceIdRegistryOfferResource,
} from '../models/deviceIdRegistry/DeviceIdRegistryResource';

export interface IDeviceIdRegistryService {
  getDeviceIdRegistries: (filters?: object) => Promise<DataListResponse<DeviceIdRegistryResource>>;
  getDeviceIdRegistryOffers: (
    filters?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryOfferResource>>;
  getSubscribedDeviceIdRegistryOffers: (
    organisationId: string,
    filters?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryOfferResource>>;
}

@injectable()
export default class DeviceIdRegistryService implements IDeviceIdRegistryService {
  getDeviceIdRegistries(filters: object = {}): Promise<DataListResponse<DeviceIdRegistryResource>> {
    const endpoint = 'device_id_registries';
    const options = {
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }

  getDeviceIdRegistryOffers(
    filters: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryOfferResource>> {
    const endpoint = 'device_technical_id_registry_service_offers';
    const options = {
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }

  getSubscribedDeviceIdRegistryOffers(
    organisationId: string,
    filters: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryOfferResource>> {
    const endpoint = 'device_technical_id_registry_service_offers';
    const options = {
      subscriber_id: organisationId,
      signed_agreement_filter: true,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
}
