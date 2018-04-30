import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { User } from '../models/settings/settings';

const UsersService = {
  getUsers(
    organisationId: string,
    filters: object = {},
  ): Promise<DataListResponse<User>> {
    const endpoint = `users`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  },
  getUser(userId: string, organisationId: string): Promise<DataResponse<User>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  },
  createUser(
    organisationId: string,
    body: Partial<User>,
  ): Promise<DataResponse<User>> {
    const endpoint = `users?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  },
  updateUser(
    userId: string,
    organisationId: string,
    body: Partial<User>,
  ): Promise<DataResponse<User>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.putRequest(endpoint, body);
  },
};

export default UsersService;
