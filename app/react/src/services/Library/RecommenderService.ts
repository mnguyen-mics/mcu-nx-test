import { IPluginService } from './../PluginService';
import ApiService, { DataListResponse, DataResponse } from '../ApiService';
import { PluginProperty, Recommender } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import { PluginLayout } from '../../models/plugin/PluginLayout';
import { TYPES } from '../../constants/types';
import { injectable, inject } from 'inversify';

export interface IRecommenderService {
  getRecommenders: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<Recommender>>;
  getRecommenderProperty: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<PluginProperty>>;
  deleteRecommender: (id: string, options: object) => Promise<{}>;
  getRecommender: (
    id: string,
    options: object,
  ) => Promise<DataResponse<Recommender>>;
  createRecommender: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<Recommender>>;
  updateRecommender: (
    id: string,
    options: object,
  ) => Promise<DataResponse<Recommender>>;
  updateRecommenderProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PluginProperty> | void>;
  getLocalizedPluginLayout: (
    pInstanceId: string,
  ) => Promise<PluginLayout | null>;
}

@injectable()
export class RecommenderService extends PluginInstanceService<Recommender>
  implements IRecommenderService {
  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor() {
    super('recommenders');
  }

  getRecommenders(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<Recommender>> {
    const endpoint = 'recommenders';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }

  getRecommenderProperty(
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PluginProperty>> {
    const endpoint = `recommenders/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  }

  deleteRecommender(id: string, options: object = {}) {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  }

  getRecommender(
    id: string,
    options: object = {},
  ): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  createRecommender(
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  }

  updateRecommender(
    id: string,
    options: object = {},
  ): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  }

  updateRecommenderProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PluginProperty> | void> {
    const endpoint = `recommenders/${id}/properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'recommenders',
      id,
      endpoint,
    );
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const recommender = res.data;
      return this._pluginService
        .findPluginFromVersionId(recommender.version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            recommender.version_id,
          );
        });
    });
  }
}

export default new RecommenderService();
