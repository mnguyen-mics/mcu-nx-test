import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PasswordRequirementResource, PasswordValidityResource } from '../models/communities';
import { injectable } from 'inversify';
import UserResource from '../models/directory/UserResource';

export interface ICommunityService {
  getCommunityPasswordRequirements: (
    technicalName: string,
  ) => Promise<DataResponse<PasswordRequirementResource>>;

  getCommunityPasswordValidity: (
    technicalName: string,
    password: string,
  ) => Promise<DataResponse<PasswordValidityResource>>;

  getCommunityUsers: (
    communityId: string,
    params: object,
  ) => Promise<DataListResponse<UserResource>>;
}

@injectable()
export class CommunityService implements ICommunityService {
  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<PasswordRequirementResource>> {
    const endpoint = `communities/technical_name=${technicalName}/password_requirements`;
    const options = {
      authenticated: false,
    };
    return ApiService.getRequest(endpoint, {}, {}, options);
  }

  getCommunityPasswordValidity(
    technicalName: string,
    password: string,
  ): Promise<DataResponse<PasswordValidityResource>> {
    const body = {
      password: password,
    };
    const endpoint = `communities/technical_name=${technicalName}/password_validity`;
    const options = {
      authenticated: false,
    };
    return ApiService.postRequest(endpoint, body, {}, {}, options);
  }

  getCommunityUsers(communityId: string, params: object): Promise<DataListResponse<UserResource>> {
    const endpoint = `communities/${communityId}/users`;
    return ApiService.getRequest(endpoint, params);
  }
}
