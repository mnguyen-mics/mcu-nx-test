
import { Index } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { SearchSetting } from '@mediarithmics-private/mcs-components-library/lib/utils/LocationSearchHelper';
import { FunnelFilter } from '../../models/datamart/UserActivitiesFunnel'

export type DimensionFilterOperator = "EXACT"
                                      | "NUMERIC_EQUAL"
                                      | "NUMERIC_GREATER_THAN"
                                      | "NUMERIC_LESS_THAN"
                                      | "IN_LIST"
                                      | "IS_NULL";


export const dimensionFilterOperator: DimensionFilterOperator[] = [
                                        "EXACT",
                                        "NUMERIC_EQUAL",
                                        "NUMERIC_GREATER_THAN",
                                        "NUMERIC_LESS_THAN",
                                        "IN_LIST",
                                        "IS_NULL"
                                      ]

export type BooleanOperator = "OR" | "AND";
               
export const booleanOperator: BooleanOperator[] = ["OR", "AND"]

const funnelFilterSearchSetting = {
  paramName: 'filter',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
      if (query.feedType) {
          return query.feedType.split(',');
      }
      return [];
  },
  serialize: (value: FunnelFilter[]) => value.join(','),
  isValid: (query: Index<string>) => !query.feedType || query.feedType.split(',').length > 0,
};

export const FUNNEL_SEARCH_SETTING: SearchSetting[] = [funnelFilterSearchSetting];
