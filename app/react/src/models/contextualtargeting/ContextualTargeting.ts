export type ContextualTargetingStatus = 'INIT' | 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'LIVE_PUBLISHED';

export interface ContextualTargetingResource {
  id: string;
  segment_id: string;
  volume_ratio?: number;
  status: ContextualTargetingStatus;
  live_activation_ts?: number;
  last_lift_computation_ts?: number;
  created_ts: number;
  created_by: string;
  last_modified_ts?: number;
  last_modified_by?: string;
}
