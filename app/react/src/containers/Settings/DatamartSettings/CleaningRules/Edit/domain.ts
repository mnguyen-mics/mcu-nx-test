import {
  UserEventCleaningRuleResource,
  UserEventContentFilterResource,
  UserProfileCleaningRuleResource,
  UserActivityType,
  CleaningRuleAction,
} from './../../../../../models/cleaningRules/CleaningRules';

interface ActionAndPeriod {
  selectedValue: CleaningRuleAction;
  periodNumber: number;
  periodUnit: string;
}

export interface UserEventCleaningRuleFormData {
  userEventCleaningRule?: UserEventCleaningRuleResource;
  userEventContentFilter?: UserEventContentFilterResource;
  eventNameFilter?: string;
  channelFilter?: string;
  activityTypeFilter?: UserActivityType;
  actionAndPeriod: ActionAndPeriod;
  cleaningRuleType: 'USER_EVENT_CLEANING_RULE';
}

export const INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA: UserEventCleaningRuleFormData = {
  actionAndPeriod: {
    selectedValue: 'KEEP',
    periodNumber: 1,
    periodUnit: 'D',
  },
  cleaningRuleType: 'USER_EVENT_CLEANING_RULE',
};

export interface UserProfileCleaningRuleFormData {
  userProfileCleaningRule?: UserProfileCleaningRuleResource;
  actionAndPeriod: ActionAndPeriod;
  cleaningRuleType: 'USER_PROFILE_CLEANING_RULE';
}

export const INITIAL_USER_PROFILE_CLEANING_RULE_FORM_DATA: UserProfileCleaningRuleFormData = {
  actionAndPeriod: {
    selectedValue: 'DELETE',
    periodNumber: 1,
    periodUnit: 'D',
  },
  cleaningRuleType: 'USER_PROFILE_CLEANING_RULE',
};

export type CleaningRuleFormData = UserEventCleaningRuleFormData | UserProfileCleaningRuleFormData;

export const isUserEventCleaningRuleFormData = (cleaningRuleFormData: CleaningRuleFormData): cleaningRuleFormData is UserEventCleaningRuleFormData => {
  return ((cleaningRuleFormData as UserEventCleaningRuleFormData).cleaningRuleType === 'USER_EVENT_CLEANING_RULE');
}

export const USER_EVENT_CLEANING_RULE_MIN_LIFE_DURATION = 'P1D';

export const USER_EVENT_CLEANING_RULE_MAX_LIFE_DURATION = 'P36500D';

export interface UserEventCleaningRuleAndOptionalFilter {
  rule: UserEventCleaningRuleResource;
  filter?: UserEventContentFilterResource;
}

export interface EditCleaningRuleRouteMatchParam {
  organisationId: string;
  datamartId: string;
  cleaningRuleId: string;
}
