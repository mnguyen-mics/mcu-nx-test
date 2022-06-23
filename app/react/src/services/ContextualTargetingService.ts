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

  publishContextualTargeting: (
    segmentId: string,
    contextualTargetingId: string,
    volumeRatio: number,
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

  publishContextualTargeting(
    segmentId: string,
    contextualTargetingId: string,
    volumeRatio: number,
  ): Promise<DataResponse<ContextualTargetingResource>> {
    const body = {
      type: 'PUBLISH',
      volume_ratio: volumeRatio,
    };
    return ApiService.postRequest(
      `audience_segments/${segmentId}/contextual_targetings/${contextualTargetingId}/actions`,
      body,
    );
  }
}
