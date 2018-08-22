import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import PluginService from '../PluginService';
import { PluginProperty, Recommender } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';

class RecommenderService extends PluginInstanceService<Recommender> {
  
  constructor() {
    super('recommenders');
  };

  getRecommenders(organisationId: string, options: object = {}): Promise<DataListResponse<Recommender>> {
    const endpoint = 'recommenders';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  getRecommenderProperty(id: string, options: object = {}): Promise<DataListResponse<PluginProperty>> {
    const endpoint = `recommenders/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  };

  deleteRecommender(id: string, options: object = {}) {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  };

  getRecommender(id: string, options: object = {}): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  };

  createRecommender(organisationId: string, options: object = {}): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  };

  updateRecommender(id: string, options: object = {}): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  };

  updateRecommenderProperty(
    organisationId: string, id: string, technicalName: string, params: object = {}): Promise<DataResponse<PluginProperty> | void> {
    const endpoint = `recommenders/${id}/properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(params, organisationId, 'recommenders', id, endpoint);
  };

};

export default new RecommenderService();
