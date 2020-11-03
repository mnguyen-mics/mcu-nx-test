
import { Index } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { DATE_SEARCH_SETTINGS, SearchSetting } from '../../utils/LocationSearchHelper';
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

export type FilterOperatorLabel = "equals" | "in"

export const showFilterOperator: FilterOperatorLabel[] = [
  "equals",
  "in"
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
  defaultValue: undefined,
  deserialize: (query: Index<string>) => {
    if (query.filter) {
      return query.filter.split(',')
    }
    return [];
  },
  serialize: (value: FunnelFilter[]) => value.join(','),
  isValid: (query: Index<string>) => !query.filter || query.filter.split(',').length > 0,
};

export const FUNNEL_SEARCH_SETTING: SearchSetting[] = [...DATE_SEARCH_SETTINGS, funnelFilterSearchSetting];


export const funnelMessages = defineMessages({
  noData: {
    id: 'funnel.common.noData',
    defaultMessage: 'There is no data for your query. Please retry later!'
  },
  exportTitle: {
    id: 'funnel.export.title',
    defaultMessage: 'Funnel Report'
  },
  total: {
    id: 'funnel.common.totla',
    defaultMessage: 'Total'
  },
  stepName: {
    id: 'funnel.common.stepName',
    defaultMessage: 'step name'
  },
  userPoints: {
    id: 'funnel.common.userPoints',
    defaultMessage: 'user points'
  },
  duration: {
    id: 'funnel.common.interationDuration',
    defaultMessage: 'interaction duration'
  }
});