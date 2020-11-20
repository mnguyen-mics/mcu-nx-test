import { PaginatedApiParam } from './../utils/ApiHelper';
import { AudienceFeatureResource } from '../models/audienceFeature';
import { injectable } from 'inversify';
import ApiService, { DataListResponse, DataResponse } from './ApiService';

export interface AudienceFeatureOptions extends PaginatedApiParam {
  keywords?: string[];
}

export interface IAudienceFeatureService {
  getAudienceFeatures: (
    datamartId: string,
    demographicIds?: string[],
    options?: AudienceFeatureOptions,
  ) => Promise<DataListResponse<AudienceFeatureResource>>;
  getAudienceFeature: (
    datamartId: string,
    predicateId: string,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
}

@injectable()
export class AudienceFeatureService implements IAudienceFeatureService {
  getAudienceFeatures(
    datamartId: string,
    demographicIds?: string[],
    options?: AudienceFeatureOptions,
  ): Promise<DataListResponse<AudienceFeatureResource>> {
    let endpoint = `datamarts/${datamartId}/audience_features`;
    if (demographicIds && demographicIds.length >= 1) {
      endpoint = `${endpoint}?exclude=${demographicIds.toString()}`;
    }
    return ApiService.getRequest(endpoint, options);
  }

  getAudienceFeature(
    datamartId: string,
    audienceFeatureId: string,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    const endpoint = `datamarts/${datamartId}/audience_features/${audienceFeatureId}`;
    return ApiService.getRequest(endpoint);
  }
}
