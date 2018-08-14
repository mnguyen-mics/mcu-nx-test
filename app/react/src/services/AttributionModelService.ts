import {
  AttributionModel,
} from './../models/Plugins';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import PluginInstanceService from './PluginInstanceService';

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

};

export default new AttributionModelService();
