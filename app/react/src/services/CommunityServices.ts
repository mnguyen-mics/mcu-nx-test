import ApiService, { DataListResponse } from './ApiService';
import { CommunityResource } from '../models/communities';

const CommunityService = {
  getCommunity(
    communityToken: string,
  ): Promise<DataListResponse<CommunityResource>> {
    const endpoint = `communities/${communityToken}/security_policies`;

    return ApiService.getRequest(endpoint);
  },
};

export default CommunityService;
