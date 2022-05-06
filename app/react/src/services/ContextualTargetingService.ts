import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import { ContextualTargetingResource } from '../models/contextualtargeting/ContextualTargeting';

export interface IContextualTargetingService {
  getContextualTargetings: (
    segmentId: string,
  ) => Promise<DataListResponse<ContextualTargetingResource>>;

  createContextualTargeting: (
    segmentId: string,
    body: Partial<ContextualTargetingResource>,
  ) => Promise<DataResponse<ContextualTargetingResource>>;
}

@injectable()
export class ContextualTargetingService implements IContextualTargetingService {
  getContextualTargetings(
    segmentId: string,
  ): Promise<DataListResponse<ContextualTargetingResource>> {
    return ApiService.getRequest(`audience_segments/${segmentId}/contextual_targetings`);
  }

  createContextualTargeting(
    segmentId: string,
    body: Partial<ContextualTargetingResource>,
  ): Promise<DataResponse<ContextualTargetingResource>> {
    return ApiService.postRequest(`audience_segments/${segmentId}/contextual_targetings`, body);
  }
}
