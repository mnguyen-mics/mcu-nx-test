import { AttributionModel } from './../models/Plugins';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { PaginatedApiParam } from '../utils/ApiHelper';
import PluginInstanceService from './PluginInstanceService';
import { PluginLayout } from '../models/plugin/PluginLayout';
import { injectable } from 'inversify';

export interface IAttributionModelService extends PluginInstanceService<AttributionModel> {
  getAttributionModels: (
    organisationId: string,
    options: PaginatedApiParam,
  ) => Promise<DataListResponse<AttributionModel>>;
  getAttributionModel: (attributionModelId: string) => Promise<DataResponse<AttributionModel>>;

  deleteAttributionModel: (attributionModelId: string) => Promise<any>;
  getLocalizedPluginLayout: (pInstanceId: string) => Promise<PluginLayout | null>;
}

@injectable()
export class AttributionModelService
  extends PluginInstanceService<AttributionModel>
  implements IAttributionModelService
{
  constructor() {
    super('attribution_models');
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
  }

  getAttributionModel(attributionModelId: string): Promise<DataResponse<AttributionModel>> {
    const endpoint = `attribution_models/${attributionModelId}`;

    return ApiService.getRequest(endpoint);
  }

  deleteAttributionModel(attributionModelId: string): Promise<any> {
    const endpoint = `attribution_models/${attributionModelId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const attributionModel = res.data;
      return this._pluginService
        .findPluginFromVersionId(attributionModel.attribution_processor_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            attributionModel.attribution_processor_id,
          );
        });
    });
  }
}
