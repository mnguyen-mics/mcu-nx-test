import {
  PAGINATION_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import { Index } from '../../../../../utils';
import { AudiencePartitionType } from '../../../../../models/audiencePartition/AudiencePartitionResource';

const typeSearchSetting = {
  paramName: 'type',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.type) {
      return query.type.split(',');
    }
    return [];
  },
  serialize: (value: AudiencePartitionType[]) => value.join(','),
  isValid: (query: Index<string>) => !query.type || query.type.split(',').length > 0,
};

export interface PartitionTypeSearchSettings {
  type: AudiencePartitionType[];
}

export const PARTITIONS_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...DATAMART_SEARCH_SETTINGS,
  typeSearchSetting,
];
