import {
  AttributionModel,
} from './../models/Plugins';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import PluginInstanceService from './PluginInstanceService';
import PluginService from './PluginService';
import { PluginLayout } from '../models/plugin/PluginLayout';

class AttributionModelService extends PluginInstanceService<AttributionModel> {
  constructor() {
    super('attribution_models')
  }

  getAttributionModels(
    organisationId: string,
    options: PaginatedApiParam = {},
  ): Promise<DataListResponse<AttributionModel>> {
    const endpoint = 'attribution_models';
    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  getAttributionModel(attributionModelId: string): Promise<DataResponse<AttributionModel>> {
    const endpoint = `attribution_models/${attributionModelId}`;

    return ApiService.getRequest(endpoint);
  };

  deleteAttributionModel(attributionModelId: string): Promise<any> {
    const endpoint = `attribution_models/${attributionModelId}`;
    return ApiService.deleteRequest(endpoint);
  };

  getLocalizedPluginLayout(pInstanceId: string): Promise<DataResponse<PluginLayout> | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const attributionModel = res.data;
      return PluginService.findPluginFromVersionId(attributionModel.attribution_processor_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          attributionModel.attribution_processor_id
        );
      });
    });
  }

};

export default new AttributionModelService();
