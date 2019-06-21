import ApiService, { DataListResponse, DataResponse } from './ApiService';
import UserResource from '../models/directory/UserResource';
import { injectable } from 'inversify';

export interface IUsersService {
  getUsers: (
    organisationId: string,
    filters?: object,
  ) => Promise<DataListResponse<UserResource>>;
  getUser: (
    userId: string,
    organisationId: string,
  ) => Promise<DataResponse<UserResource>>;
  createUser: (
    organisationId: string,
    body: Partial<UserResource>,
  ) => Promise<DataResponse<UserResource>>;
  updateUser: (
    userId: string,
    organisationId: string,
    body: Partial<UserResource>,
  ) => Promise<DataResponse<UserResource>>;
}

@injectable()
export class UsersService implements IUsersService {
  getUsers(
    organisationId: string,
    filters: object = {},
  ): Promise<DataListResponse<UserResource>> {
    const endpoint = `users`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }
  getUser(
    userId: string,
    organisationId: string,
  ): Promise<DataResponse<UserResource>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }
  createUser(
    organisationId: string,
    body: Partial<UserResource>,
  ): Promise<DataResponse<UserResource>> {
    const endpoint = `users?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, body);
  }
  updateUser(
    userId: string,
    organisationId: string,
    body: Partial<UserResource>,
  ): Promise<DataResponse<UserResource>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.putRequest(endpoint, body);
  }
}
