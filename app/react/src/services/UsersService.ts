import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import { UserWithRole } from '../containers/Settings/OrganisationSettings/Users/domain';
import UserResource, { UserCreationWithRoleResource } from '../models/directory/UserResource';

export interface IUsersService {
  getUsers: (organisationId: string, filters?: object) => Promise<DataListResponse<UserResource>>;

  getUsersWithUserRole: (
    organisationId: string,
    filters?: object,
  ) => Promise<DataListResponse<UserWithRole>>;

  getUser: (userId: string, organisationId: string) => Promise<DataResponse<UserResource>>;

  createUser: (
    organisationId: string,
    body: Partial<UserCreationWithRoleResource>,
  ) => Promise<DataResponse<UserResource>>;

  updateUser: (
    userId: string,
    organisationId: string,
    body: Partial<UserResource>,
  ) => Promise<DataResponse<UserResource>>;

  deleteUser: (userId: string, organisationId: string) => Promise<DataResponse<UserResource>>;
}

@injectable()
export class UsersService implements IUsersService {
  getUsers(organisationId: string, filters: object = {}): Promise<DataListResponse<UserResource>> {
    const endpoint = `users`;
    const options = {
      organisation_id: organisationId,
      ...filters,
    };
    return ApiService.getRequest(endpoint, options);
  }

  getUsersWithUserRole(
    communityId: string,
    options: object = {},
  ): Promise<DataListResponse<UserWithRole>> {
    const endpoint = `community/${communityId}/users.user_roles`;
    return ApiService.getRequest(endpoint, options);
  }

  getUser(userId: string, organisationId: string): Promise<DataResponse<UserResource>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.getRequest(endpoint);
  }

  createUser(
    organisationId: string,
    body: Partial<UserCreationWithRoleResource>,
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

  deleteUser(userId: string, organisationId: string): Promise<DataResponse<UserResource>> {
    const endpoint = `users/${userId}?organisation_id=${organisationId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
