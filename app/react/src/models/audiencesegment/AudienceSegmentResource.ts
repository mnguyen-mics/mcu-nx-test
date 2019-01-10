import {
  PublicJobExecutionResource,
  JobExecutionStatus,
} from '../Job/JobResource';

export interface AudienceSegmentResource {
  id: string;
  organisation_id: string;
  name: string;
  short_description?: string;
  technical_name?: string;
  default_ttl?: number;
  datamart_id: string;
  provider_name?: string;
  persisted: boolean;
  type: AudienceSegmentType;
}

export type AudienceSegmentType =
  | 'USER_LIST'
  | 'USER_QUERY'
  | 'USER_ACTIVATION'
  | 'USER_PARTITION'
  | 'USER_PIXEL'
  | 'USER_LOOKALIKE';

export type UserQueryEvaluationMode = 'REAL_TIME' | 'AUTOMATIC' | 'ON_DEMAND';

export type FeedType = 'FILE_IMPORT' | 'TAG';

export type LookAlikeAlgorithm =
  | 'CLUSTER_OVERLAP'
  | 'FIELD_SCORE'
  | 'MULTI_VARIATE_DISTANCE';

export type AudienceLookalikeStatus =
  | 'DRAFT'
  | 'CALIBRATING'
  | 'CALIBRATION_ERROR'
  | 'CALIBRATED';

export interface UserListSegment extends AudienceSegmentResource {
  feed_type: FeedType;
  type: 'USER_LIST';
}

export interface UserLookalikeSegment extends AudienceSegmentResource {
  type: 'USER_LOOKALIKE';
  lookalike_algorithm: LookAlikeAlgorithm;
  source_segment_id: string;
  minimum_score: number;
  extension_factor: number;
  partitionId: string;
  queryId: string;
  status: AudienceLookalikeStatus;
}

export interface UserPartitionSegment extends AudienceSegmentResource {
  part_number: number;
  audience_partition_id: string;
  type: 'USER_PARTITION';
}

export interface UserActivationSegment extends AudienceSegmentResource {
  clickers: boolean;
  exposed: boolean;
  type: 'USER_ACTIVATION';
}

export type AudienceSegmentShape =
  | UserListSegment
  | UserQuerySegment
  | UserLookalikeSegment
  | UserPartitionSegment
  | UserActivationSegment;

export interface OverlapJobResult extends PublicJobExecutionResource {
  external_model_name: 'PUBLIC_AUDIENCE_SEGMENT';
  output_result: {
    status: JobExecutionStatus;
    result: {
      data_file_uri: string;
    };
  };
}

export interface UserQuerySegment extends AudienceSegmentResource {
  query_id?: string;
  type: 'USER_QUERY';
}

export interface SegmentOverlapResult {
  segment_id: number;
  datamart_id: number;
  segment_size: number;
}

export interface OverlapItemResult {
  segment_source_id: number;
  segment_intersect_with: number;
  overlap_number: number;
}

export interface OverlapFileResource {
  date: number;
  segments: SegmentOverlapResult[];
  overlaps: OverlapItemResult[];
}