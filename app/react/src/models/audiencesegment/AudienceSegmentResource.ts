export interface AudienceSegmentResource {
  id: string;
  organisation_id: string;
  name: string;
  short_description?: string,
  technical_name?: string;
  default_lifetime?: number;
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
  'USER_PARTITION';

export type UserQueryEvaluationMode =
  'REAL_TIME' |
  'AUTOMATIC' |
  'ON_DEMAND';

export type FeedType = 
  'FILE_IMPORT' |
  'TAG';


  export interface UserListSegment extends AudienceSegmentResource {
    feed_type: FeedType
  }
  
  
  
  export type AudienceSegment = UserListSegment
  
