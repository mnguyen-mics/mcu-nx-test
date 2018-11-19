import { SearchSetting } from './../../../../utils/LocationSearchHelper';
import { Index } from './../../../../utils/index';
import {
  PAGINATION_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';

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
  statusSearchSetting,
];
