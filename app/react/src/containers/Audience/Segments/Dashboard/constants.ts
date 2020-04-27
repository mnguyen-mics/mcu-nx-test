import {
  PAGINATION_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  SEGMENTS_FILTERS_SEARCH_SETTINGS,
  ALL_USERS,
  DATE_SEARCH_SETTINGS_WITHOUT_CURRENT_DAY,
} from '../../../../utils/LocationSearchHelper';

type QueryType = { types: string };

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
  isValid: (query: QueryType) =>
    !query.types || query.types.split(',').length > 0,
};

export const SEGMENT_QUERY_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  typeSearchSetting,
];


export const DATAMART_USERS_ANALYTICS_SETTING = [
  ...SEGMENTS_FILTERS_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS_WITHOUT_CURRENT_DAY,
  ...ALL_USERS
]

export interface AudienceReportData {
  day: string;
  user_points: number;
  user_accounts?: number;
  emails?: number;
  desktop_cookie_ids?: number;
  user_point_deletions?: number;
  user_point_additions?: number;
  mobile_cookie_ids?: number;
  mobile_ad_ids?: number;
}

export type AudienceReport = AudienceReportData[];

export interface OverlapData {
  hasOverlap: boolean;
  isRunning: boolean;
  isInError: boolean;
  data: Data | null;
}

export interface FormattedOverlapData {
  segment_source_id: string;
  segment_source_size: number;
  segment_intersect_with: {
    id: string;
    name: string;
    segment_size: number;
  };
  overlap_number: number;
}

export interface Data {
  date: number;
  formattedOverlap: Array<FormattedOverlapData | null>;
}
