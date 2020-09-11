import { ChannelType } from './../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { SearchSetting } from '../../../../../utils/LocationSearchHelper';

export interface ChannelFilter extends Filter {
  type: ChannelType[];
}

export interface ChannelTypeItem {
  key: ChannelType;
  value: string;
}

export const TYPE_SEARCH_SETTINGS: SearchSetting[] = [
  {
    paramName: 'type',
    defaultValue: undefined,
    deserialize: query => {
      if (query.type) {
        return query.type.split(',');
      }
      return [];
    },
    serialize: (value: ChannelType[]) => value.join(','),
    isValid: () => true,
  },
];
