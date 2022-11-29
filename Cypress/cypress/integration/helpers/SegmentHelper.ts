import { postRequest } from './ApiHelper';

export type AudienceSegmentType =
  | 'USER_LIST'
  | 'USER_QUERY'
  | 'USER_ACTIVATION'
  | 'USER_PARTITION'
  | 'USER_PIXEL'
  | 'USER_LOOKALIKE'
  | 'USER_CLIENT'
  | 'EDGE';

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
  user_points_count?: number;
  user_accounts_count?: number;
  emails_count?: number;
  desktop_cookie_ids_count?: number;
  mobile_cookie_ids_count?: number;
  mobile_ad_ids_count?: number;
  creation_ts?: number;
  paused: boolean;
}

export type UserQuerySegmentSubtype =
  | 'STANDARD'
  | 'AB_TESTING_CONTROL_GROUP'
  | 'AB_TESTING_EXPERIMENT';

export type Engagement = 'E_COMMERCE_ENGAGEMENT' | 'CHANNEL_ENGAGEMENT';

export interface UserQuerySegment extends AudienceSegmentResource {
  query_id?: string;
  type: 'USER_QUERY';
  subtype?: UserQuerySegmentSubtype;
  weight?: number;
  control_group_id?: string;
  control_group?: boolean;
  target_metric: Engagement;
}

export async function createUserQuery(
  datamartId: number,
  organisationId: number,
  queryId: string,
  segmentName: string,
  access_token: string,
): Promise<UserQuerySegment> {
  const endpoint = `audience_segments?organisation_id=${organisationId}`;
  const body = {
    type: 'USER_QUERY',
    datamart_id: datamartId,
    organisation_id: organisationId,
    query_id: queryId,
    name: segmentName,
    persisted: true,
  };
  return postRequest(endpoint, access_token, body).then(({ data: segment }) => {
    return segment;
  });
}
