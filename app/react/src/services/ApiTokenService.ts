import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { ApiToken } from '../models/settings/settings';

const ApiTokenService = {
  getApiTokens(
    userId: string,
    organisationId: string,
  ): Promise<DataListResponse<ApiToken>> {
    const endpoint = `users/${userId}/api_tokens`;
    const options = {
      organisation_id: organisationId,
    };
    return ApiService.getRequest(endpoint, options);
  },
  getApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ): Promise<DataResponse<ApiToken>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  },
  createApiToken(
    userId: string,
    organisationId: string,
    body?: Partial<ApiToken>,
  ): Promise<DataResponse<ApiToken>> {
    const endpoint = `users/${userId}/api_tokens?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },
  updateApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
    body: Partial<ApiToken>,
  ): Promise<DataResponse<ApiToken>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.putRequest(endpoint, body);
  },
  deleteApiToken(
    apiTokenId: string,
    userId: string,
    organisationId: string,
  ): Promise<DataResponse<ApiToken>> {
    const endpoint = `users/${userId}/api_tokens/${apiTokenId}?organisation_id=${organisationId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default ApiTokenService;
