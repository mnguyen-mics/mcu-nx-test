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

  updateDeviceIdRegistry: (
    deviceIdRegistryId: string,
    communityId: string,
    body: Partial<DeviceIdRegistryResource>,
  ) => Promise<DataResponse<DeviceIdRegistryResource>>;

  createDeviceIdRegistryDatamartSelection: (
    deviceIdRegistryId: string,
    datamartId: string,
  ) => Promise<DataResponse<DeviceIdRegistryDatamartSelectionResource>>;

  getDeviceIdRegistryDatamartSelections: (
    deviceIdRegistryId: string,
  ) => Promise<DataListResponse<DeviceIdRegistryDatamartSelectionResource>>;

  updateDeviceIdRegistryDatamartSelections: (
    deviceIdRegistryId: string,
    datamartIds: string[],
  ) => Promise<any>;

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

  updateDeviceIdRegistry(
    deviceIdRegistryId: string,
    communityId: string,
    body: Partial<DeviceIdRegistryResource>,
  ): Promise<DataResponse<DeviceIdRegistryResource>> {
    const endpoint = `device_id_registries/${deviceIdRegistryId}`;
    const params = {
      community_id: communityId,
    };
    return ApiService.putRequest(endpoint, body, params);
  }

  createDeviceIdRegistryDatamartSelection(
    deviceIdRegistryId: string,
    datamartId: string,
  ): Promise<DataResponse<DeviceIdRegistryDatamartSelectionResource>> {
    const endpoint = `datamarts/${datamartId}/device_id_registries`;
    const body: Partial<DeviceIdRegistryDatamartSelectionResource> = {
      device_id_registry_id: deviceIdRegistryId,
      datamart_id: datamartId,
    };
    return ApiService.postRequest(endpoint, body);
  }

  getDeviceIdRegistryDatamartSelections(
    deviceIdRegistryId: string,
  ): Promise<DataListResponse<DeviceIdRegistryDatamartSelectionResource>> {
    //TODO
    return ApiService.getRequest(`device_id_registries/${deviceIdRegistryId}/datamart_selections`);
  }

  updateDeviceIdRegistryDatamartSelections(
    deviceIdRegistryId: string,
    datamartIds: string[],
  ): Promise<any> {
    const body = {
      datamart_selections: datamartIds.map(datamartId => {
        return {
          datamart_id: datamartId,
        };
      }),
    };
    //TODO
    return ApiService.putRequest(
      `device_id_registries/${deviceIdRegistryId}/datamart_selections`,
      body,
    );
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
