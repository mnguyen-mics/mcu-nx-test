import {
  PAGINATION_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  SearchSetting,
  DATAMART_SEARCH_SETTINGS,
  SORT_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';
import { AudienceSegmentType, FeedType } from '../../../../models/audiencesegment';
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
  serialize: (value: AudienceSegmentType[]) => value.join(','),
  isValid: (query: Index<string>) => !query.type || query.type.split(',').length > 0,
};

const feedTypeSearchSetting = {
  paramName: 'feed_type',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.feed_type) {
      return query.feed_type.split(',');
    }
    return [];
  },
  serialize: (value: FeedType[]) => value.join(','),
  isValid: (query: Index<string>) => !query.feed_type || query.feed_type.split(',').length > 0,
};

export const persistedSearchSetting = {
  paramName: 'persisted',
  defaultValue: '',
  deserialize: (query: Index<string>) => {
    return query.persisted;
  },
  serialize: (value: any) => value,
  isValid: () => true,
};

export interface SegmentTypeSearchSettings {
  type: AudienceSegmentType[];
}

export const SEGMENTS_SEARCH_SETTINGS: SearchSetting[] = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
  ...DATAMART_SEARCH_SETTINGS,
  ...SORT_SEARCH_SETTINGS,
  typeSearchSetting,
  feedTypeSearchSetting,
  persistedSearchSetting,
];

export const SEGMENT_SETTINGS: SearchSetting[] = [...DATE_SEARCH_SETTINGS];
