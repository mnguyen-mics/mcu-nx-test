import {
  PAGINATION_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  SearchSetting,
  DATAMART_SEARCH_SETTINGS,
  SORT_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';
import { AudienceSegmentType } from '../../../../models/audiencesegment';
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
  isValid: (query: Index<string>) =>
    !query.type || query.type.split(',').length > 0,
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
];

export const SEGMENT_SETTINGS: SearchSetting[] = [
  ...DATE_SEARCH_SETTINGS,
];
