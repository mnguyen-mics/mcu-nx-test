import { AudienceBuilderResource } from './../models/audienceBuilder/AudienceBuilderResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { injectable, inject } from 'inversify';
import { PaginatedApiParam } from '../utils/ApiHelper';
import { AudienceBuilderFormData } from '../containers/Settings/DatamartSettings/AudienceBuilder/Edit/domain';
import { TYPES } from '../constants/types';
import { IAudienceFeatureService } from '../services/AudienceFeatureService';
import { createFieldArrayModelWithMeta } from '../utils/FormHelper';

export interface AudienceBuilderOptions extends PaginatedApiParam {}

export interface IAudienceBuilderService {
  createAudienceBuilder: (
    datamartId: string,
    body: Partial<AudienceBuilderResource>,
  ) => Promise<DataResponse<AudienceBuilderResource>>;

  getAudienceBuilders: (
    datamartId: string,
    options?: AudienceBuilderOptions,
  ) => Promise<DataListResponse<AudienceBuilderResource>>;

  loadAudienceBuilder: (
    datamartId: string,
    audienceBuilderId: string,
  ) => Promise<AudienceBuilderFormData>;

  getAudienceBuilder: (
    datamartId: string,
    audienceBuilderId: string,
  ) => Promise<DataResponse<AudienceBuilderResource>>;

  updateAudienceBuilder: (
    datamartId: string,
    audienceBuilderId: string,
    body: Partial<AudienceBuilderResource>,
  ) => Promise<DataResponse<AudienceBuilderResource>>;

  deleteAudienceBuilder(datamartId: string, audienceBuilderId: string): Promise<DataResponse<any>>;
}

@injectable()
export default class AudienceBuilderService implements IAudienceBuilderService {
  @inject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  createAudienceBuilder(
    datamartId: string,
    body: Partial<AudienceBuilderResource>,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders`;
    return ApiService.postRequest(endpoint, body);
  }

  getAudienceBuilders(
    datamartId: string,
    options?: AudienceBuilderOptions,
  ): Promise<DataListResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders`;
    return ApiService.getRequest(endpoint, options);
  }

  getAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.getRequest(endpoint);
  }

  loadAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
  ): Promise<AudienceBuilderFormData> {
    return this.getAudienceBuilder(datamartId, audienceBuilderId).then(builder => {
      return Promise.all(
        builder.data.demographics_features_ids.map(id => {
          return this._audienceFeatureService
            .getAudienceFeature(datamartId, id)
            .then(feature => feature.data);
        }),
      ).then(audienceFeatures => {
        return {
          audienceBuilder: builder.data,
          audienceFeatureDemographics: audienceFeatures.map(feature => {
            return createFieldArrayModelWithMeta(feature, { name: feature.name });
          }),
        };
      });
    });
  }

  updateAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
    body: Partial<AudienceBuilderResource>,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceBuilder(datamartId: string, audienceBuilderId: string): Promise<DataResponse<any>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
