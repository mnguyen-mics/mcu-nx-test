import {
  PAGINATION_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';

type QueryType = { types: string }

const typeSearchSetting = {
  paramName: 'types',
  defaultValue: [],
  deserialize: (query: QueryType) => {
    if (query.types) {
      return query.types.split(',');
    }
    return [];
  },
  serialize: (value: string[]) => value.join(','),
  isValid: (query: QueryType) => !query.types || query.types.split(',').length > 0,
};

export const SEGMENT_QUERY_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  typeSearchSetting,
];
