
import { Index } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { SearchSetting } from '@mediarithmics-private/mcs-components-library/lib/utils/LocationSearchHelper';
import { FunnelFilter } from '../../models/datamart/UserActivitiesFunnel'
import { defineMessages } from "react-intl";

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

export type EventTypeDimension = "$transaction_confirmed"
  | "$item_list_view"
  | "$item_view"
  | "$basket_view";


export const eventTypesDimension: EventTypeDimension[] = [
  "$transaction_confirmed",
  "$item_list_view",
  "$item_view",
  "$basket_view"
]

export type BooleanOperator = "OR" | "AND";

export const booleanOperator: BooleanOperator[] = ["OR", "AND"]

const funnelFilterSearchSetting = {
  paramName: 'filter',
  defaultValue: [],
  deserialize: (query: Index<string>) => {
    if (query.filter) {
      return query.filter.split(',')
    }
    return [];
  },
  serialize: (value: FunnelFilter[]) => value.join(','),
  isValid: (query: Index<string>) => query.filter.split(',').length > 0,
};

export const FUNNEL_SEARCH_SETTING: SearchSetting[] = [funnelFilterSearchSetting];


export const messages = defineMessages({
  noData: {
    id: 'funnel.common.noData',
    defaultMessage: 'There is no data for your query. Please retry later!'
  }
});