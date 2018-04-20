import {
  PAGINATION_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  SearchSetting,
  DATAMART_SEARCH_SETTINGS
} from '../../../../utils/LocationSearchHelper';
import { Index } from '../../../../utils';

const typeSearchSetting = {
  paramName: 'type',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.type) {
      return query.type.split(',');
    }
    return [];
  },
  serialize: (value: string[]) => value.join(','),
  isValid: (query: Index<string>) => !query.type || query.type.split(',').length > 0,
};

export const SEGMENTS_SEARCH_SETTINGS: SearchSetting[] = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
  ...DATAMART_SEARCH_SETTINGS,
  typeSearchSetting,
];
