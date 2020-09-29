import { AudienceBuilderResource } from './../models/audienceBuilder/AudienceBuilderResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { injectable } from 'inversify';

export interface IAudienceBuilderService {
  getAudienceBuilders: (
    datamartId: string,
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
  getAudienceBuilders(
    datamartId: string,
  ): Promise<DataListResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders`;
    return ApiService.getRequest(endpoint);
  }

  getAudienceBuilder(
    datamartId: string,
    audienceBuilderId: string,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders/${audienceBuilderId}`;
    return ApiService.getRequest(endpoint);
  }

  createAudienceBuilder(
    datamartId: string,
    body: Partial<AudienceBuilderResource>,
  ): Promise<DataResponse<AudienceBuilderResource>> {
    const endpoint = `datamarts/${datamartId}/audience_builders`;
    return ApiService.postRequest(endpoint, body);
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
