import ApiService, { DataResponse } from './ApiService';
import { CommunityPasswordRequirement } from '../models/communities';

const CommunityService = {
  getCommunityPasswordRequirements(
    communityToken: string,
  ): Promise<DataResponse<CommunityPasswordRequirement>> {
    const endpoint = `communities/technical_name=yellow-velvet/password_requirements`;

    return ApiService.getRequest(endpoint);
  },
};

export default CommunityService;
