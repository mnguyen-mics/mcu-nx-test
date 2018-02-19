export interface AudienceSegmentResource {
  id: string;
  name: string;
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
