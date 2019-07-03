import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { StoredProcedureResource } from '../models/datamart/StoredProcedure';
import PluginInstanceService from './PluginInstanceService';
import PluginService from './PluginService';
import { PluginLayout } from '../models/plugin/PluginLayout';

export interface IStoredProcedureService extends PluginInstanceService<StoredProcedureResource> {
  listStoredProcedure: (
    options?: StoredProcedureQueryStringParameters
  ) => Promise<DataListResponse<StoredProcedureResource>>;
  getStoredProcedure: (
    storedProcedureId: string,
  ) => Promise<DataResponse<StoredProcedureResource>>;
  createStoredProcedure: (
    storedProcedure: Partial<StoredProcedureResource>
  ) => Promise<DataResponse<StoredProcedureResource>>
}

export interface StoredProcedureQueryStringParameters {
  datamart_id?: string;
  first_result?: number;
  max_results?: number;
  order_by?: string;
  keywords?: string;
}


export class StoredProcedureService extends PluginInstanceService<StoredProcedureResource> implements IStoredProcedureService {

  constructor() {
    super("stored_procedures")
  }

  listStoredProcedure(
    options?: StoredProcedureQueryStringParameters
  ): Promise<DataListResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures`;
    return ApiService.getRequest(endpoint);
  }
  getStoredProcedure(
    storedProcedureId: string,
  ): Promise<DataResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures/${storedProcedureId}`;
    return ApiService.getRequest(endpoint, {});
  }
  createStoredProcedure(
    storedProcedure: Partial<StoredProcedureResource>
  ): Promise<DataResponse<StoredProcedureResource>> {
    const endpoint = `stored_procedures`;
    return ApiService.postRequest(endpoint, storedProcedure);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const storedProcedure = res.data;
      return PluginService.findPluginFromVersionId(storedProcedure.version_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          storedProcedure.version_id
        );
      });
    });
  }
}
