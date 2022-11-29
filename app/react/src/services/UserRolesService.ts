import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import UserRoleResource from '../models/directory/UserRoleResource';

export interface IUserRolesService {
  getUserRoles: (userId: string, options?: object) => Promise<DataListResponse<UserRoleResource>>;
  createUserRole: (
    userId: string,
    body: Partial<UserRoleResource>,
  ) => Promise<DataResponse<UserRoleResource>>;
  deleteUserRole: (userId: string, userRoleId: string) => Promise<DataResponse<any>>;
}

@injectable()
export class UserRolesService implements IUserRolesService {
  getUserRoles(userId: string, options?: object): Promise<DataListResponse<UserRoleResource>> {
    const endpoint = `users/${userId}/user_roles`;
    return ApiService.getRequest(endpoint, options);
  }
  createUserRole(
    userId: string,
    body: Partial<UserRoleResource>,
  ): Promise<DataResponse<UserRoleResource>> {
    const endpoint = `users/${userId}/user_roles`;
    return ApiService.postRequest(endpoint, body);
  }
  deleteUserRole(userId: string, userRoleId: string): Promise<DataResponse<any>> {
    const endpoint = `users/${userId}/user_roles/${userRoleId}`;
    return ApiService.deleteRequest(endpoint);
  }
}
