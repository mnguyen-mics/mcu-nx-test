import { Identifier } from './../../containers/Audience/Timeline/Monitoring';
import { Index } from '../../utils';
import { UserActivityEventResource } from '../datamart/UserActivityResource';
import {
  OperatingSystemFamily,
  BrowserFamily,
} from '../datamart/graphdb/RuntimeSchema';
import { Dictionary } from 'lodash';
import { UserAccountCompartmentDatamartSelectionResource } from '../datamart/DatamartResource';
import UserChoiceResource from '../userchoice/UserChoiceResource';
import { ProcessingResource } from '../processing';

export interface Activity {
  $email_hash: string | object;
  $events: UserActivityEventResource[];
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
  $matched_exit_condition_id?: string;
}

export interface UserScenarioActivityCardProps {
  activity: Activity;
}

export interface Property {
  $referrer: string;
  $url: string;
  language: string;
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

export interface UserEmailIdentifierProviderResource {
  technical_name: string;
  creation_ts?: number;
  last_activity_ts?: number;
  last_modified_ts?: number;
  expiration_ts?: number;
  active?: boolean;
  status?: string;
}

export interface UserAgentInfo {
  form_factor: FormFactor;
  os_family: OperatingSystemFamily;
  browser_family?: BrowserFamily;
  browser_version?: string;
  brand?: string;
  model?: string;
  os_version?: string;
  carrier?: string;
  raw_value?: string;
}

export interface UserAgentIdentifierProviderResource {
  technical_name: string;
  creation_ts?: number;
  last_activity_ts?: number;
  expiration_ts?: number;
}

export interface UserAgentIdMappingResource {
  user_agent_id: string;
  realm_name: string;
  last_activity_ts: number;
}

export interface UserPointIdentifierInfo {
  user_point_id: string;
  creation_ts?: number;
  type: 'USER_POINT';
}

export interface UserEmailIdentifierInfo {
  hash: string;
  email?: string;
  operator?: string;
  creation_ts: number;
  last_activity_ts: number;
  providers: UserEmailIdentifierProviderResource[];
  type: 'USER_EMAIL';
}

export interface UserAccountIdentifierInfo {
  user_account_id: string;
  creation_ts: number;
  compartment_id?: number;
  type: 'USER_ACCOUNT';
}

export interface UserAgentIdentifierInfo {
  vector_id: string;
  device?: UserAgentInfo;
  creation_ts: number;
  last_activity_ts: number;
  providers: UserAgentIdentifierProviderResource[];
  mappings: UserAgentIdMappingResource[];
  type: 'USER_AGENT';
}

export type UserIdentifierInfo =
  | UserPointIdentifierInfo
  | UserEmailIdentifierInfo
  | UserAccountIdentifierInfo
  | UserAgentIdentifierInfo;

export function isUserPointIdentifier(
  userIdentifier: UserIdentifierInfo,
): userIdentifier is UserPointIdentifierInfo {
  return userIdentifier.type === 'USER_POINT';
}

export function isUserAccountIdentifier(
  userIdentifier: UserIdentifierInfo,
): userIdentifier is UserAccountIdentifierInfo {
  return userIdentifier.type === 'USER_ACCOUNT';
}

export function isUserAgentIdentifier(
  userIdentifier: UserIdentifierInfo,
): userIdentifier is UserAgentIdentifierInfo {
  return userIdentifier.type === 'USER_AGENT';
}

export function isUserEmailIdentifier(
  userIdentifier: UserIdentifierInfo,
): userIdentifier is UserEmailIdentifierInfo {
  return userIdentifier.type === 'USER_EMAIL';
}

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

export interface UserChoicesWithProcessings {
  userChoices: UserChoiceResource[];
  processings: ProcessingResource[];
}

export interface MonitoringData {
  userAgentList: UserAgentIdentifierInfo[];
  userAccountsByCompartmentId: Dictionary<UserAccountIdentifierInfo[]>;
  userAccountCompartments: UserAccountCompartmentDatamartSelectionResource[];
  userEmailList: UserEmailIdentifierInfo[];
  userPointList: UserPointIdentifierInfo[];
  userSegmentList: UserSegmentResource[];
  userChoices: UserChoicesWithProcessings;
  userProfile: UserProfileGlobal;
  lastSeen: number;
  userIdentifier: Identifier;
  isUserFound: boolean;
}

export interface UserProfileWithAccountId {
  userAccountId: string;
  profile: UserProfileResource;
}

export interface UserProfilePerCompartmentAndUserAccountId {
  [compartmentId: string]: {
    compartmentName: string;
    profiles: UserProfileWithAccountId[];
  };
}

export interface FormattedUserAccountCompartmentResource {
  [compartmentId: string]: {
    id: string;
    organisation_id: string;
    token: string;
    name: string;
    archived: boolean;
  };
}

export type UserProfileGlobalType = 'legacy' | 'pionus';

export interface UserProfileGlobal {
  type?: UserProfileGlobalType;
  profile: UserProfilePerCompartmentAndUserAccountId | UserProfileResource;
}

export interface UserProfileResource {
  compartment_id?: string; // Should have a `$` prefix but the routes are buggy right now
  user_account_id?: string; // Should have a `$` prefix but the routes are buggy right now
  $compartment_id?: string; // Future proof
  $user_account_id?: string; // Future proof
  creation_date?: number;
  birth_date?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  isClient?: boolean;
  // Custom fields
  [key: string]: any;
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

export interface EmailHashResource {
  hash: string;
  email?: string;
}
