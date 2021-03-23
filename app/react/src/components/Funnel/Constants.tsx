
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

export type DeviceFormFactorDimension = "OTHER" |
  "PERSONAL_COMPUTER" |
  "SMART_TV" |
  "GAME_CONSOLE" |
  "SMARTPHONE" |
  "TABLET" |
  "WEARABLE_COMPUTER";

export const deviceFormFactorDimensions: DeviceFormFactorDimension[] = [
  "OTHER",
  "PERSONAL_COMPUTER",
  "SMART_TV",
  "GAME_CONSOLE",
  "SMARTPHONE",
  "TABLET",
  "WEARABLE_COMPUTER"
]

export type DeviceOsFamilyDimension = "OTHER" |
  "WINDOWS" |
  "MAC_OS" |
  "LINUX" |
  "ANDROID" |
  "IOS";

export const deviceOsFamilyDimensions: DeviceOsFamilyDimension[] = [
  "OTHER",
  "WINDOWS",
  "MAC_OS",
  "LINUX",
  "ANDROID",
  "IOS"
]

export type DeviceBrowserFamilyDimension = "OTHER" |
  "CHROME" |
  "IE" |
  "FIREFOX" |
  "SAFARI" |
  "OPERA" |
  "STOCK_ANDROID" |
  "BOT" |
  "EMAIL_CLIENT" |
  "MICROSOFT_EDGE";

export const deviceBrowserFamilyDimensions: DeviceBrowserFamilyDimension[] = [
  "OTHER",
  "CHROME",
  "IE",
  "FIREFOX",
  "SAFARI",
  "OPERA",
  "STOCK_ANDROID",
  "BOT",
  "EMAIL_CLIENT",
  "MICROSOFT_EDGE"
]

export type DimensionEnum = EventTypeDimension |
  DeviceFormFactorDimension |
  DeviceOsFamilyDimension |
  DeviceBrowserFamilyDimension

export const enumValuesByName = {
  'EVENT_TYPE': eventTypesDimension,
  'DEVICE_OS_FAMILY': deviceOsFamilyDimensions,
  'DEVICE_FORM_FACTOR': deviceFormFactorDimensions,
  'DEVICE_BROWSER_FAMILY': deviceBrowserFamilyDimensions,
} 

export type FunnelTemplate = "RETURN_ON_AD_SPEND" | "BRAND_HALO";

export type BooleanOperator = "OR" | "AND";

export const booleanOperator: BooleanOperator[] = ["AND", "OR"]

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


const funnelTemplateSearchSetting = {
  paramName: 'template',
  defaultValue: undefined,
  deserialize: (query: Index<FunnelTemplate>) => query.template,
  serialize: (value: FunnelTemplate) => value,
  isValid: (query: Index<FunnelTemplate>) => !!query.template,
};

const splitBySearchSetting = {
  paramName: 'splitBy',
  defaultValue: undefined,
  deserialize: (query: Index<string>) => {
    if (query.splitBy) {
      return query.splitBy
    }
    return [];
  },
  serialize: (value: string) => value,
  isValid: (query: Index<string>) => !!query.splitBy
};

export const FUNNEL_SEARCH_SETTING: SearchSetting[] = [
  ...DATE_SEARCH_SETTINGS, 
  funnelFilterSearchSetting, 
  funnelTemplateSearchSetting, 
  splitBySearchSetting
];

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
  },
  channelId: {
    id: 'funnel.common.channelId',
    defaultMessage: 'channel id'
  },
  conversion: {
    id: 'funnel.common.conversion',
    defaultMessage: '# units'
  },
  amount: {
    id: 'funnel.common.amount',
    defaultMessage: 'amount'
  },
  funnelEmptyState: {
    id: 'funnel.funnelEmptyState',
    defaultMessage: 'Set up your steps to see the funnel'
  },
  showMeAnExample: {
    id: 'funnel.showMeAnExample',
    defaultMessage: 'Show me an example'
  },
  share: {
    id: 'funnel.share',
    defaultMessage: 'Share'
  },
  copied: {
    id: 'funnel.copied',
    defaultMessage: 'The funnel url is successfully copied to your clipboard'
  }
});
