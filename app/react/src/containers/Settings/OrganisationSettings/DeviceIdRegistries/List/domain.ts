import { DeviceIdRegistryType } from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { Filter } from '../../../DatamartSettings/Common/domain';
import { SearchSetting } from '../../../../../utils/LocationSearchHelper';

export interface DeviceIdRegistryFilter extends Filter {
  types: DeviceIdRegistryType[];
}

export interface DeviceIdRegistryTypeItem {
  key: DeviceIdRegistryType;
  value: DeviceIdRegistryType;
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
    serialize: (value: DeviceIdRegistryType[]) => value.join(','),
    isValid: () => true,
  },
];
