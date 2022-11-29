import { ChannelType } from './../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { SearchSetting } from '../../../../../utils/LocationSearchHelper';

export interface ChannelFilter extends Filter {
  types: ChannelType[];
}

export interface ChannelTypeItem {
  key: ChannelType;
  value: string;
}

export const TYPE_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'types',
    defaultValue: undefined,
    deserialize: query => {
      if (query.types) {
        return query.types.split(',');
      }
      return [];
    },
    serialize: (value: ChannelType[]) => value.join(','),
    isValid: () => true,
  },
];
