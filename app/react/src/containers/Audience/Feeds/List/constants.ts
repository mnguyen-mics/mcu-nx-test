import { SearchSetting, PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';
import { Index } from '../../../../utils';
import { Status } from '../../../../models/Plugins';
import { AudienceFeedType } from '../../../../services/AudienceSegmentFeedService';

const feedTypeSearchSetting = {
  paramName: 'feedType',
  defaultValue: ['EXTERNAL_FEED'],
  deserialize: (query: Index<string>) => {
    if (query.feedType) {
      return query.feedType.split(',');
    }
    return [];
  },
  serialize: (value: AudienceFeedType[]) => value.join(','),
  isValid: (query: Index<string>) => !query.feedType || query.feedType.split(',').length > 0,
};

const artifactIdSearchSetting = {
  paramName: 'artifactId',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.artifactId) {
      return query.artifactId.split(',');
    }
    return [];
  },
  serialize: (value: string[]) => value.join(','),
  isValid: (query: Index<string>) => !query.artifactId || query.artifactId.split(',').length > 0,
};

const statusSearchSetting = {
  paramName: 'status',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.status) {
      return query.status.split(',');
    }
    return [];
  },
  serialize: (value: Status[]) => value.join(','),
  isValid: (query: Index<string>) => !query.status || query.status.split(',').length > 0,
};

export const FEEDS_SEARCH_SETTINGS: SearchSetting[] = [
  ...PAGINATION_SEARCH_SETTINGS,
  feedTypeSearchSetting,
  artifactIdSearchSetting,
  statusSearchSetting,
];
