export type UserActivityResourceShape = VisitUserActivityResource;

export type ActivitySessionStatus =
  | 'IN_SESSION'
  | 'SESSION_SNAPSHOT'
  | 'CLOSED_SESSION'
  | 'NO_SESSION';

export interface UserActivityOrigin {
  $ts?: number;
  $source?: string;
  $channel?: string;
  $campaign_name?: string;
  $campaign_technical_name?: string;
  $campaign_id?: number;
  $sub_campaign_technical_name?: string;
  $sub_campaign_id?: number;
  $message_id?: number;
  $message_technical_name?: string;
  $keywords?: string;
  $creative_name?: string;
  $creative_technical_name?: string;
  $creative_id?: number;
  $engagement_content_id?: string;
  $social_network?: string;
  $referral_path?: string;
  $log_id?: string;
  $gclid?: string;
  [key: string]: any;
}

export interface UserActivityLocation {
  $source?: 'GPS' | 'IP' | 'OTHER';
  // ISO 3166-1-alpha-2
  $country?: string;
  // GeoNames Admin1 codes
  $region?: string;
  // ISO 3166-2
  $iso_region?: string;
  // GeoNameId
  $city?: string;
  // UN/LOCODE
  $iso_city?: string;
  $zip_code?: string;
  // Latitude and longitude with format: lat,lon
  $latlon?: string;
  [key: string]: any;
}

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap {
  [key: string]: AnyJson;
}
interface JsonArray extends Array<AnyJson> {}

export interface UserActivityEventResource {
  $ts?: number;
  $event_name: string;
  $properties?: AnyJson;
  [key: string]: any;
}

interface UserActivityResource {
  $ts?: number;
  $session_status: ActivitySessionStatus;
  $ttl?: number;
  $user_agent_id?: string;
  $user_account_id?: string;
  $compartment_id?: string;
  $email_hash?: { hash: string; email?: string };
  $origin?: UserActivityOrigin;
  $location?: UserActivityLocation;
  $events?: UserActivityEventResource[];
}

export interface VisitUserActivityResource extends UserActivityResource {
  $type: 'SITE_VISIT';
  $session_duration?: number;
  $topics?: { [key: string]: { [key: string]: number } };
}
