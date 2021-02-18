import { AudienceBuilderResource } from './../models/audienceBuilder/AudienceBuilderResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { injectable } from 'inversify';
import { PaginatedApiParam } from '../utils/ApiHelper';

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
  getAudienceBuilder: (
    datamartId: string,
    audienceBuilderId: string,
  ) => Promise<DataResponse<AudienceBuilderResource>>;
  updateAudienceBuilder: (
    datamartId: string,
    audienceBuilderId: string,
    body: Partial<AudienceBuilderResource>,
  ) => Promise<DataResponse<AudienceBuilderResource>>;
  deleteAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
  ): Promise<DataResponse<any>>;
}

@injectable()
export default class AudienceBuilderService implements IAudienceBuilderService {
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

  updateAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
    body: Partial<AudienceBuilderResource>,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.putRequest(endpoint, body);
  }

  deleteAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
  ): Promise<DataResponse<any>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
