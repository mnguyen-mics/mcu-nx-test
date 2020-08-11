import {
  SearchSetting,
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
} from '../../../utils/LocationSearchHelper';
import { Index } from '../../../utils/index';

const statusSearchSetting = {
  paramName: 'status',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.type) {
      return query.type.split(',');
    }
    return [];
  },
  serialize: (value: string[]) => value.join(','),
  isValid: (query: Index<string>) =>
    !query.type || query.type.split(',').length > 0,
};

export const IMPORTS_SEARCH_SETTINGS: SearchSetting[] = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATAMART_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
  statusSearchSetting,
];
