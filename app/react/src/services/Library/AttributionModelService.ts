
import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import PluginInstanceService from '../PluginInstanceService';
import { AttributionModel } from '../../models/Plugins';



class AttributionModelService extends PluginInstanceService<AttributionModel> {
  constructor() {
    super("attribution_models")
  }


  getAttributionModels(organisationId: string, options: object = {}): Promise<DataListResponse<AttributionModel>> {
    const endpoint = 'attribution_models';
    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  };
  
  deleteAttributionModel(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `attribution_models/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  };


};

export default new AttributionModelService();
