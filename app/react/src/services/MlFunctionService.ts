import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { MlFunctionResource } from '../models/datamart/MlFunction';
import PluginInstanceService from './PluginInstanceService';
import PluginService from './PluginService';
import { PluginLayout } from '../models/plugin/PluginLayout';

export interface IMlFunctionService extends PluginInstanceService<MlFunctionResource> {
  listMlFunctions: (
    options?: MlFunctionQueryStringParameters
  ) => Promise<DataListResponse<MlFunctionResource>>;
  getMlFunctions: (
    mlFunctionId: string,
  ) => Promise<DataResponse<MlFunctionResource>>;
  createMlFunctions: (
    mlFunction: Partial<MlFunctionResource>
  ) => Promise<DataResponse<MlFunctionResource>>
}

export interface MlFunctionQueryStringParameters {
  datamart_id?: string;
  first_result?: number;
  max_results?: number;
  order_by?: string;
  keywords?: string;
}


export class MlFunctionService extends PluginInstanceService<MlFunctionResource> implements IMlFunctionService {

  constructor() {
    super("ml_functions")
  }

  listMlFunctions(
    options?: MlFunctionQueryStringParameters
  ): Promise<DataListResponse<MlFunctionResource>> {
    const endpoint = `ml_functions`;
    return ApiService.getRequest(endpoint);
  }
  getMlFunctions(
    mlFunctionId: string,
  ): Promise<DataResponse<MlFunctionResource>> {
    const endpoint = `ml_functions/${mlFunctionId}`;
    return ApiService.getRequest(endpoint, {});
  }
  createMlFunctions(
    mlFunction: Partial<MlFunctionResource>
  ): Promise<DataResponse<MlFunctionResource>> {
    const endpoint = `ml_functions`;
    return ApiService.postRequest(endpoint, mlFunction);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const mlFunction = res.data;
      return PluginService.findPluginFromVersionId(mlFunction.version_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          mlFunction.version_id
        );
      });
    });
  }
}
