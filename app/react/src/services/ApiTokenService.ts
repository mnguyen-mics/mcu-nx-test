import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import ApiTokenResource from '../models/directory/ApiTokenResource';
import { injectable } from 'inversify';

export interface IApiTokenService {
  getApiTokens: (
    userId: string,
    organisationId: string,
  ) => Promise<DataListResponse<ApiTokenResource>>;
  getApiToken: (
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ) => Promise<DataResponse<ApiTokenResource>>;
  createApiToken: (
    userId: string,
    organisationId: string,
    body?: Partial<ApiTokenResource>,
  ) => Promise<DataResponse<ApiTokenResource>>;
  updateApiToken: (
    apiTokenId: string,
    userId: string,
    organisationId: string,
    body: Partial<ApiTokenResource>,
  ) => Promise<DataResponse<ApiTokenResource>>;
  deleteApiToken: (
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ) => Promise<DataResponse<ApiTokenResource>>;
}

@injectable()
export class ApiTokenService implements IApiTokenService {
  getApiTokens(
    userId: string,
    organisationId: string,
  ): Promise<DataListResponse<ApiTokenResource>> {
    const endpoint = `users/${userId}/api_tokens`;
    const options = {
      organisation_id: organisationId,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ): Promise<DataResponse<ApiTokenResource>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
  createApiToken(
    userId: string,
    organisationId: string,
    body?: Partial<ApiTokenResource>,
  ): Promise<DataResponse<ApiTokenResource>> {
    const endpoint = `users/${userId}/api_tokens?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  }
  updateApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
    body: Partial<ApiTokenResource>,
  ): Promise<DataResponse<ApiTokenResource>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ): Promise<DataResponse<ApiTokenResource>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.deleteRequest(endpoint);
  }
}

export default ApiTokenService;
