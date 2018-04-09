export interface AudienceSegmentResource {
  id: string;
  organisation_id: string;
  name: string;
  short_description?: string,
  technical_name?: string;
  default_ttl?: number;
  datamart_id: string;
  provider_name?: string;
  persisted: boolean,
  type: AudienceSegmentType
}

export type AudienceSegmentType =
  'USER_LIST' |
  'USER_QUERY' |
  'USER_ACTIVATION' |
  'USER_PARTITION' |
  'USER_PIXEL' |
  'USER_LOOKALIKE';

export type UserQueryEvaluationMode =
  'REAL_TIME' |
  'AUTOMATIC' |
  'ON_DEMAND';

export type FeedType = 
  'FILE_IMPORT' |
  'TAG';

export type LookAlikeAlgorithm = 
  | 'CLUSTER_OVERLAP'
  | 'FIELD_SCORE'
  | 'MULTI_VARIATE_DISTANCE';

export type AudienceLookalikeStatus = 
  | 'DRAFT'
  | 'CALIBRATING'
  | 'CALIBRATION_ERROR'
  | 'CALIBRATED'

  export interface UserListSegment extends AudienceSegmentResource {
    feed_type: FeedType;
    type: 'USER_LIST';
  }

  export interface UserQuerySegment extends AudienceSegmentResource {
    query_id: string;
    type: 'USER_QUERY';
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
  
  
  export type AudienceSegmentShape = UserListSegment | UserQuerySegment
  
