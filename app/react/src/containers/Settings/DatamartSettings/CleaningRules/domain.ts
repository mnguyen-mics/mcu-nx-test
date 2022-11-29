import { CleaningRuleType } from './../../../../models/cleaningRules/CleaningRules';
import {
  PaginationSearchSettings,
  SearchSetting,
  PAGINATION_SEARCH_SETTINGS,
} from './../../../../utils/LocationSearchHelper';

export interface CleaningRulesTypeAndDatamartSearchSettings {
  type: string;
  datamartId: string;
}

export interface CleaningRulesFilter
  extends PaginationSearchSettings,
    CleaningRulesTypeAndDatamartSearchSettings {}

export const CLEANING_RULES_TYPE_AND_DATAMART_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'type',
    defaultValue: undefined,
    deserialize: query => {
      if (query.type) {
        return query.type;
      }
      return undefined;
    },
    serialize: (value: CleaningRuleType) => value,
    isValid: () => true,
  },
  {
    paramName: 'datamartId',
    defaultValue: '',
    deserialize: query => {
      return query.datamartId;
    },
    serialize: (value: any) => value,
    isValid: () => true,
  },
];

export const CLEANING_RULES_SEARCH_SETTINGS: SearchSetting[] = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...CLEANING_RULES_TYPE_AND_DATAMART_SEARCH_SETTINGS,
];
