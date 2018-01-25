import ApiService, { DataListResponse } from './ApiService';
import { ConsentResource, ConsentPurpose } from '../models/consent';

const ConsentService = {
  getConsents(
    organisationId: string,
    options: {
      purpose?: ConsentPurpose[],
      first_result?: number,
      max_results?: number,
    } = {},
  ): Promise<DataListResponse<ConsentResource>> {
    const endpoint = 'consents';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
};

export default ConsentService;
