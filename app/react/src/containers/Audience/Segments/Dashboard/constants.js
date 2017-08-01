import {
    PAGINATION_SEARCH_SETTINGS,
    DATE_SEARCH_SETTINGS,
    KEYWORD_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';

const typeSearchSetting = {
  paramName: 'types',
  defaultValue: [],
  deserialize: query => {
    if (query.types) {
      return query.types.split(',');
    }
    return [];
  },
  serialize: value => value.join(','),
  isValid: query => !query.types || query.types.split(',').length > 0,
};

export const SEGMENT_QUERY_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  typeSearchSetting,
];
