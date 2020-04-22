import {
  UserEventCleaningRuleResource,
  UserEventContentFilterResource,
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
}

export const INITIAL_USER_EVENT_CLEANING_RULE_FORM_DATA: UserEventCleaningRuleFormData = {
  actionAndPeriod: {
    selectedValue: 'KEEP',
    periodNumber: 1,
    periodUnit: 'D',
  },
};

export const USER_EVENT_CLEANING_RULE_MIN_LIFE_DURATION = "P1D";

export const USER_EVENT_CLEANING_RULE_MAX_LIFE_DURATION = "P36500D";

export interface EditUserEventCleaningRuleRouteMatchParam {
  organisationId: string;
  datamartId: string;
  cleaningRuleId: string;
}
