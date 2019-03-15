export interface CleaningRuleResource {
  type: CleaningRuleType;
  id: string;
  archived: boolean;
};

export type CleaningRuleType = 'USER_ACTIVITY_CLEANING_RULE';

export type UserActivityType =
  'ALL' |
  'USER_PLATFORM' |
  'TOUCH' |
  'SITE_VISIT' |
  'APP_VISIT' |
  'EMAIL' |
  'DISPLAY_AD' |
  'STOPWATCH' |
  'STAGING_AREA' |
  'RECOMMENDER' |
  'USER_SCENARIO_START' |
  'USER_SCENARIO_STOP' |
  'USER_SCENARIO_NODE_ENTER' |
  'USER_SCENARIO_NODE_EXIT';

export interface UserEventCleaningRuleResource extends CleaningRuleResource{
  datamart_id: number;
  channel_filter?: string;
  activity_type_filter?: UserActivityType;
  life_duration: string;
};