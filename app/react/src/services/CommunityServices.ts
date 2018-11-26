import ApiService, { DataResponse } from './ApiService';
import { CommunityPasswordRequirement, CommunityPasswordValidity } from '../models/communities';

const CommunityService = {

  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<CommunityPasswordRequirement>> {
    const endpoint = `communities/technical_name=${technicalName}/password_requirements`;
    const options = {
        authenticated: false,
    }
    return ApiService.getRequest(endpoint, {}, {}, options);
  },

  getCommunityPasswordValidity(
    technicalName: string,
    password: string,
  ): Promise<DataResponse<CommunityPasswordValidity>> {
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
