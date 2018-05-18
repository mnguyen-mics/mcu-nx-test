export interface Activity {
  $email_hash: string | object;
  $events: EventProps[];
  $location: {
    $latlon: any[]; // ???
  };
  $origin: object;
  $session_duration: number;
  $session_status: string;
  $site_id: string;
  $topics: object;
  $ts: number;
  $ttl: number;
  $type: string;
  $user_account_id: string;
  $user_agent_id: string;
  $app_id: string;
}

export interface ActivityCardProps {
  activity: Activity;
  datamartId: string;
  identifiers: IdentifiersProps;
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

export interface Device {
  brand?: string;
  browser_family?: string;
  browser_version?: string;
  carrier?: string;
  form_factor?: string;
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

export interface Segment {
  creation_ts: number;
  data_bag: any; // type it better
  expiration_ts: number;
  last_modified_ts: string;
  segment_id: string;
}