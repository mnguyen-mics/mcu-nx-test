import ApiService, { DataResponse } from './ApiService';
import { CommunityPasswordRequirement } from '../models/communities';

const CommunityService = {
  getCommunityPasswordRequirements(
    technicalName: string,
  ): Promise<DataResponse<CommunityPasswordRequirement>> {
    const params = {};
    const headers = {};
    // To be changed with ${technicalName} when available
    const endpoint = `communities/technical_name=yellow-velvet/password_requirements`;
    const options = {
        authenticated: false,
    }
    return ApiService.getRequest(endpoint, params, headers, options);
  },
};

export default CommunityService;
