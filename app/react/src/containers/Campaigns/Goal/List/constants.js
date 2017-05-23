import {
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';

export const GOAL_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...FILTERS_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS
];
