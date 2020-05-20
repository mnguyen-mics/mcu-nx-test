export type CleaningRuleType =
  | 'USER_EVENT_CLEANING_RULE'
  | 'USER_PROFILE_CLEANING_RULE';

export type CleaningRuleAction = 'KEEP' | 'DELETE';

export type CleaningRuleStatus = 'DRAFT' | 'LIVE' | 'ARCHIVED';

export interface CleaningRuleResource {
  type: CleaningRuleType;
  id: string;
  datamart_id: string;
  action: CleaningRuleAction;
  status: CleaningRuleStatus;
  archived: boolean;
}

export type UserActivityType =
  | 'ALL'
  | 'USER_PLATFORM'
  | 'TOUCH'
  | 'SITE_VISIT'
  | 'APP_VISIT'
  | 'EMAIL'
  | 'DISPLAY_AD'
  | 'STOPWATCH'
  | 'STAGING_AREA'
  | 'RECOMMENDER'
  | 'USER_SCENARIO_START'
  | 'USER_SCENARIO_STOP'
  | 'USER_SCENARIO_NODE_ENTER'
  | 'USER_SCENARIO_NODE_EXIT';

export interface UserEventCleaningRuleResource extends CleaningRuleResource {
  channel_filter?: string;
  activity_type_filter?: UserActivityType;
  life_duration?: string;
}

export interface UserProfileCleaningRuleResource extends CleaningRuleResource {
  compartment_filter?: string;
  life_duration?: string;
}

export type ExtendedCleaningRuleResource =
  | UserEventCleaningRuleResource
  | UserProfileCleaningRuleResource;

export type ContentFilterType =
  | 'EVENT_NAME_FILTER'
  | 'OBJECT_TREE_EXPRESSION_FILTER';

export interface UserEventContentFilterResource {
  content_type: ContentFilterType;
  filter: string;
}

export interface UserEventCleaningRuleResourceWithFilter
  extends UserEventCleaningRuleResource,
    Partial<UserEventContentFilterResource> {}

export type ExtendedCleaningRuleResourceWithFilter =
  | UserEventCleaningRuleResourceWithFilter
  | UserProfileCleaningRuleResource;

export function isUserEventCleaningRuleResource(
  cleaningRule: ExtendedCleaningRuleResource,
): cleaningRule is UserEventCleaningRuleResource {
  return cleaningRule.type === 'USER_EVENT_CLEANING_RULE';
}

export function isUserProfileCleaningRuleResource(
  cleaningRule: ExtendedCleaningRuleResource,
): cleaningRule is UserProfileCleaningRuleResource {
  return cleaningRule.type === 'USER_PROFILE_CLEANING_RULE';
}

export function getNextCleaningRuleStatus(
  status: CleaningRuleStatus
): CleaningRuleStatus {
  switch(status) {
    case 'DRAFT':
      return 'LIVE'
    default:
      return 'ARCHIVED'
  }
}
