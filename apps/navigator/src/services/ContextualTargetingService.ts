import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { injectable } from 'inversify';
import { ContextualTargetingResource } from '../models/contextualtargeting/ContextualTargeting';

export type ActivationPlatform = 'XANDR';

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
    activationPlatforms: ActivationPlatform[],
  ) => Promise<DataResponse<ContextualTargetingResource>>;
  archiveContextualTargeting: (
    segmentId: string,
    contextualTargetingId: string,
  ) => Promise<DataResponse<ContextualTargetingResource>>;
  getContextualTargetingLiftFile: (
    segmentId: string,
    contextualTargetingId: string,
  ) => Promise<Blob>;
  getContextualTargetingSignatureFile: (
    segmentId: string,
    contextualTargetingId: string,
  ) => Promise<Blob>;
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
    activationPlatforms: ActivationPlatform[],
  ): Promise<DataResponse<ContextualTargetingResource>> {
    const body = {
      type: 'PUBLISH',
      volume_ratio: volumeRatio,
      activation_platforms: activationPlatforms,
    };
    return ApiService.postRequest(
      `audience_segments/${segmentId}/contextual_targetings/${contextualTargetingId}/actions`,
      body,
    );
  }

  archiveContextualTargeting(
    segmentId: string,
    contextualTargetingId: string,
  ): Promise<DataResponse<ContextualTargetingResource>> {
    const body = {
      type: 'ARCHIVE',
    };
    return ApiService.postRequest(
      `audience_segments/${segmentId}/contextual_targetings/${contextualTargetingId}/actions`,
      body,
    );
  }

  getContextualTargetingLiftFile(segmentId: string, contextualTargetingId: string): Promise<Blob> {
    return ApiService.getRequest(
      `audience_segments/${segmentId}/contextual_targetings/${contextualTargetingId}/lift_computation.csv`,
    );
  }

  getContextualTargetingSignatureFile(
    segmentId: string,
    contextualTargetingId: string,
  ): Promise<Blob> {
    return ApiService.getRequest(
      `audience_segments/${segmentId}/contextual_targetings/${contextualTargetingId}/contextual_targeting_signature.csv`,
    );
  }
}
