import { Index } from '../../utils';

export interface Activity {
  $email_hash: string | object;
  $events: EventProps[];
  $location: {
    $latlon: string[];
  };
  $origin: object;
  $session_duration: number;
  $session_status:
    | 'IN_SESSION'
    | 'SESSION_SNAPSHOT'
    | 'CLOSED_SESSION'
    | 'NO_SESSION';
  $site_id: string;
  $topics: Index<Index<number>>;
  $ts: number;
  $ttl: number;
  $type: string;
  $user_account_id: string;
  $user_agent_id: string;
  $app_id: string;
  $node_id?: number;
  $node_name?: string;
  $scenario_name?: string;
  $scenario_id?: number;
  $previous_node_id?: number;
  $previous_node_name?: string;
}

export interface ActivityCardProps {
  activity: Activity;
  datamartId: string;
  identifiers: IdentifiersProps;
}

export interface UserScenarioActivityCardProps {
  activity: Activity;
}

export interface Property {
  $referrer: string;
  $url: string;
  language: string;
}

export interface EventProps {
  $event_name: string;
  $properties: Property[];
  $ts: number;
}

export interface UserAgent {
  creation_ts: number;
  device: Device;
  last_activity_ts: number;
  mappings: any[]; // type it better
  providers: any[]; // type it better
  type: 'USER_AGENT';
  vector_id: string;
}

export interface UserPoint {
  type: 'USER_POINT';
  user_point_id: string;
}

export type UserIdentifierShape = UserAgent | UserPoint;

export type FormFactor = 'TABLET' | 'SMARTPHONE' | 'PERSONAL_COMPUTER';

export interface Device {
  brand?: string;
  browser_family?: string;
  browser_version?: string;
  carrier?: string;
  form_factor?: FormFactor;
  model?: string;
  os_family?: string;
  os_version?: string;
  raw_value?: string;
}

export interface IdentifiersProps {
  isLoading: boolean;
  hasItems: boolean;
  items: {
    USER_ACCOUNT: any[]; // type it better
    USER_AGENT: UserAgent[];
    USER_EMAIL: any[]; // type it better
    USER_POINT: UserPoint[];
  };
}

export interface UserProfileResource {
  creation_date?: number;
  birth_date?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  isClient?: boolean;
}

export interface UserSegmentResource {
  segment_id: string;
  data_bag: string;
  last_modified_ts?: number;
  creation_ts?: number;
  expiration_ts?: number;
}

export interface Cookies {
  mics_lts?: string;
  mics_uaid?: string;
  mics_vid?: string;
}

export interface OriginProps {
  $campaign_id?: string;
  $campaign_name?: string;
  $campaign_technical_name?: string;
  $channel?: string;
  $creative_id?: string;
  $creative_name?: string;
  $creative_technical_name?: string;
  $engagement_content_id?: string;
  $gclid?: string;
  $keywords?: string;
  $log_id?: string;
  $message_id?: string;
  $message_technical_name?: string;
  $referral_path?: string;
  $social_network?: string;
  $source?: string;
  $sub_campaign_id?: string;
  $sub_campaign_technical_name?: string;
  $ts?: number;
}
