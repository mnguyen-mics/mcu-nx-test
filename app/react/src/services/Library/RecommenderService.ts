import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PluginProperty, Recommender } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import { PluginLayout } from '../../models/plugin/PluginLayout';
import { injectable } from 'inversify';

export interface IRecommenderService extends PluginInstanceService<Recommender> {
  getRecommenders: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<Recommender>>;
  getRecommenderProperty: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<PluginProperty>>;
  deleteRecommender: (id: string) => Promise<DataResponse<Recommender>>;
  getRecommender: (id: string, options: object) => Promise<DataResponse<Recommender>>;
  createRecommender: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<Recommender>>;
  updateRecommender: (id: string, options: object) => Promise<DataResponse<Recommender>>;
  updateRecommenderProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PluginProperty> | void>;
  getLocalizedPluginLayout: (pInstanceId: string) => Promise<PluginLayout | null>;
}

@injectable()
export class RecommenderService
  extends PluginInstanceService<Recommender>
  implements IRecommenderService
{
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

  deleteRecommender(id: string): Promise<DataResponse<Recommender>> {
    const endpoint = `recommenders/${id}`;
    return ApiService.deleteRequest(endpoint);
  }

  getRecommender(id: string, options: object = {}): Promise<DataResponse<Recommender>> {
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

  updateRecommender(id: string, options: object = {}): Promise<DataResponse<Recommender>> {
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
