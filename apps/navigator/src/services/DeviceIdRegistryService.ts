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
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryResource>>;

  createDeviceIdRegistry: (
    body: Partial<DeviceIdRegistryResource>,
  ) => Promise<DataResponse<DeviceIdRegistryResource>>;

  updateDeviceIdRegistry: (
    deviceIdRegistryId: string,
    organisationId: string,
    body: Partial<DeviceIdRegistryResource>,
  ) => Promise<DataResponse<DeviceIdRegistryResource>>;

  deleteDeviceIdRegistry: (deviceIdRegistryId: string, organisationId: string) => Promise<any>;

  createDeviceIdRegistryDatamartSelection: (
    deviceIdRegistryId: string,
    datamartId: string,
  ) => Promise<DataResponse<DeviceIdRegistryDatamartSelectionResource>>;

  getDeviceIdRegistryDatamartSelections: (
    organisationId: string,
    deviceIdRegistryId: string,
  ) => Promise<DataListResponse<DeviceIdRegistryDatamartSelectionResource>>;

  updateDeviceIdRegistryDatamartSelections: (
    organisationId: string,
    deviceIdRegistryId: string,
    datamartIds: string[],
  ) => Promise<any>;

  deleteDeviceIdRegistryDatamartSelection: (id: string, datamartId: string) => Promise<any>;

  getDeviceIdRegistryOffers: (
    options?: object,
  ) => Promise<DataListResponse<DeviceIdRegistryOfferResource>>;
}

@injectable()
export default class DeviceIdRegistryService implements IDeviceIdRegistryService {
  getDeviceIdRegistries(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<DeviceIdRegistryResource>> {
    const endpoint = 'device_id_registries';
    const params = {
      organisation_id: organisationId,
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
    organisationId: string,
    body: Partial<DeviceIdRegistryResource>,
  ): Promise<DataResponse<DeviceIdRegistryResource>> {
    const endpoint = `device_id_registries/${deviceIdRegistryId}`;
    const params = {
      organisation_id: organisationId,
    };
    return ApiService.putRequest(endpoint, body, params);
  }

  deleteDeviceIdRegistry(deviceIdRegistryId: string, organisationId: string): Promise<any> {
    const endpoint = `device_id_registries/${deviceIdRegistryId}`;
    const params = {
      organisation_id: organisationId,
    };
    return ApiService.deleteRequest(endpoint, params);
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
    organisationId: string,
    deviceIdRegistryId: string,
  ): Promise<DataListResponse<DeviceIdRegistryDatamartSelectionResource>> {
    const endpoint = `device_id_registries/${deviceIdRegistryId}/datamart_selections?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }

  updateDeviceIdRegistryDatamartSelections(
    organisationId: string,
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
    return ApiService.putRequest(
      `device_id_registries/${deviceIdRegistryId}/datamart_selections?organisation_id=${organisationId}`,
      body,
    );
  }

  deleteDeviceIdRegistryDatamartSelection(id: string, datamartId: string): Promise<any> {
    return ApiService.deleteRequest(`datamarts/${datamartId}/device_id_registries/${id}`);
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
}
