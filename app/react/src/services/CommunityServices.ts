import ApiService, { DataResponse } from './ApiService';
import { PasswordRequirementResource, PasswordValidityResource } from '../models/communities';

const CommunityService = {

  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<PasswordRequirementResource>> {
    const endpoint = `communities/technical_name=${technicalName}/password_requirements`;
    const options = {
        authenticated: false,
    }
    return ApiService.getRequest(endpoint, {}, {}, options);
  },

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

export default CommunityService;
