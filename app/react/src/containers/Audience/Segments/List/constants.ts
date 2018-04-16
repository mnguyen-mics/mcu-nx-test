import {
  PAGINATION_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
} from '../../../../utils/LocationSearchHelper';
import { AudienceSegmentType } from '../../../../models/audiencesegment';

const typeSearchSetting = {
  paramName: 'types',
  defaultValue: [],
  deserialize: (query: any) => {
    if (query.types) {
      return query.types.split(',');
    }
    return [];
  },
  serialize: (value: AudienceSegmentType[]) => value.join(','),
  isValid: (query: any) => !query.types || query.types.split(',').length > 0,
};

export interface SegmentTypeSearchSettings {
  types: AudienceSegmentType[];
}

export const SEGMENTS_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
  ...DATAMART_SEARCH_SETTINGS,
  typeSearchSetting,
];
