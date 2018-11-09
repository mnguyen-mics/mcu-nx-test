import ApiService, { DataResponse } from './ApiService';
import { CommunityPasswordRequirement } from '../models/communities';

const CommunityService = {
  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<CommunityPasswordRequirement>> {
    const params = {};
    const headers = {};
    const endpoint = `communities/technical_name=${technicalName}/password_requirements`;
    const options = {
        authenticated: false,
    }
    return ApiService.getRequest(endpoint, params, headers, options);
  },
};

export default CommunityService;
