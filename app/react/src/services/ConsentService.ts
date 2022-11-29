import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { ConsentResource, ConsentPurpose } from '../models/consent';
import { injectable } from 'inversify';

export interface IConsentService {
  getConsents: (
    organisationId: string,
    options?: {
      purpose?: ConsentPurpose[];
      first_result?: number;
      max_results?: number;
    },
  ) => Promise<DataListResponse<ConsentResource>>;
}

@injectable()
export class ConsentService implements IConsentService {
  getConsents(
    organisationId: string,
    options: {
      purpose?: ConsentPurpose[];
      first_result?: number;
      max_results?: number;
    } = {},
  ): Promise<DataListResponse<ConsentResource>> {
    const endpoint = 'consents';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }
}
