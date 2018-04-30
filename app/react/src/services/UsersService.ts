import ApiService, { DataListResponse } from './ApiService';
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
};

export default UsersService;
