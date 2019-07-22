import ApiService, { DataResponse } from './ApiService';
import { PasswordRequirementResource, PasswordValidityResource } from '../models/communities';
import { injectable } from 'inversify';

export interface ICommunityService {
  getCommunityPasswordRequirements: (
    technicalName: string,
  ) => Promise<DataResponse<PasswordRequirementResource>>;

  getCommunityPasswordValidity: (
    technicalName: string,
    password: string,
  ) => Promise<DataResponse<PasswordValidityResource>>;
}

@injectable()
export class CommunityService implements ICommunityService {

  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<PasswordRequirementResource>> {
    const endpoint = `communities/technical_name=${technicalName}/password_requirements`;
    const options = {
        authenticated: false,
    }
    return ApiService.getRequest(endpoint, {}, {}, options);
  }

  getCommunityPasswordValidity(
    technicalName: string,
    password: string,
  ): Promise<DataResponse<PasswordValidityResource>> {
    const body = {
      password: password
    };
    const endpoint = `communities/technical_name=${technicalName}/password_validity`;
    const options = {
        authenticated: false,
    }
    return ApiService.postRequest(endpoint, body, {}, {}, options);
  }
};
