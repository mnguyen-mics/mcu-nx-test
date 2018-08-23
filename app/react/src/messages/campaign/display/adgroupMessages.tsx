// import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { AdGroupResource } from "../../../models/campaign/display";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';
import {
  BudgetPeriod,
  TargetedMedia,
  TargetedDevice,
  TargetedOperatingSystem,
  TargetedBrowserFamily,
  TargetedConnectionType
} from "../../../models/campaign/constants";

type ExtraKeys = 'duration';

const budgetPeriodMessages: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor
} = defineMessages({
  DAY: {
    id: 'adgroup.fields.maxBudgetPeriod.day',
    defaultMessage: 'Up. Per Day',
  },
  WEEK: {
    id: 'adgroup.fields.maxBudgetPeriod.week',
    defaultMessage: 'Up. Per Week',
  },
  MONTH: {
    id: 'adgroup.fields.maxBudgetPeriod.month',
    defaultMessage: 'Up. Per Month',
  },
});

const targetedOperatingSystemMessages: {
  [key in TargetedOperatingSystem]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedOperatingSystems.all',
    defaultMessage: 'Up. All'
  },
  IOS: {
    id: 'adgroup.fields.targetedOperatingSystems.ios',
    defaultMessage: 'Up. iOS'
  },
  ANDROID: {
    id: 'adgroup.fields.targetedOperatingSystems.android',
    defaultMessage: 'Up. Android'
  },
  WINDOWS_PHONE: {
    id: 'adgroup.fields.targetedOperatingSystems.windowsPhone',
    defaultMessage: 'Up. Windows Phone'
  },
});

const targetedMediaMessages: {
  [key in TargetedMedia]: FormattedMessage.MessageDescriptor
} = defineMessages({
  WEB: {
    id: 'adgroup.fields.targetedMedias.web',
    defaultMessage: 'Up. Website',
  },
  MOBILE_APP: {
    id: 'adgroup.fields.targetedMedias.mobileApp',
    defaultMessage: 'Up. Mobile App',
  },
});

const targetedDeviceMessages : {
  [key in TargetedDevice]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedDevices.all',
    defaultMessage: 'Up. All',
  },
  ONLY_DESKTOP: {
    id: 'adgroup.fields.targetedDevices.onlyDesktop',
    defaultMessage: 'Up. Desktop',
  },
  ONLY_MOBILE: {
    id: 'adgroup.fields.targetedDevices.onlyMobile',
    defaultMessage: 'Up. Mobile',
  },
  ONLY_TABLET: {
    id: 'adgroup.fields.targetedDevices.onlyTablet',
    defaultMessage: 'Up. Tablet',
  },
  MOBILE_AND_TABLET: {
    id: 'adgroup.fields.targetedDevices.mobileAndTablet',
    defaultMessage: 'Up. Mobile and Tablet',
  }
});

const targetedBrowserFamilyMessages : {
  [key in TargetedBrowserFamily]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedBrowserFamilies.all',
    defaultMessage: 'Up. All',
  },
  CHROME: {
    id: 'adgroup.fields.targetedBrowserFamilies.chrome',
    defaultMessage: 'Up. Chrome',
  },
  INTERNET_EXPLORER: {
    id: 'adgroup.fields.targetedBrowserFamilies.internetExplorer',
    defaultMessage: 'Up. Internet Explorer',
  },
  MICROSOFT_EDGE: {
    id: 'adgroup.fields.targetedBrowserFamilies.microsoftEdge',
    defaultMessage: 'Up. Microsoft Edge',
  },
  FIREFOX: {
    id: 'adgroup.fields.targetedBrowserFamilies.firefox',
    defaultMessage: 'Up. Firefox',
  },
  SAFARI: {
    id: 'adgroup.fields.targetedBrowserFamilies.safari',
    defaultMessage: 'Up. Safari',
  },
  OPERA: {
    id: 'adgroup.fields.targetedBrowserFamilies.opera',
    defaultMessage: 'Up. Opera',
  },
});

const targetedConnectionTypeMessages : {
  [key in TargetedConnectionType]: FormattedMessage.MessageDescriptor  
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedConnectionTypes.all',
    defaultMessage: 'Up. All'
  },
  ETHERNET: {
    id: 'adgroup.fields.targetedConnectionTypes.ethernet',
    defaultMessage: 'Up. Ethernet'
  },
  WIFI: {
    id: 'adgroup.fields.targetedConnectionTypes.wifi',
    defaultMessage: 'Up. Wifi'
  },
  CELLULAR_NETWORK_2G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork2G',
    defaultMessage: 'Up. 2G'
  },
  CELLULAR_NETWORK_3G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork3G',
    defaultMessage: 'Up. 3G'
  },
  CELLULAR_NETWORK_4G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork4G',
    defaultMessage: 'Up. 4G'
  },
});

const adGroupPropertiesMessageMap: {
  [propertyName in keyof AdGroupResource | ExtraKeys | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'adgroup.fields.id',
    defaultMessage: 'Up. ID',
  },
  name: {
    id: 'adgroup.fields.name',
    defaultMessage: 'Up. Ad Group Name',
  },
  technical_name: {
    id: 'adgroup.fields.technicalName',
    defaultMessage: 'Up. Technical Name',
  },
  visibility: {
    id: 'adgroup.fields.visibility',
    defaultMessage: 'Up. Visibility',
  },
  bid_optimizer_id: {
    id: 'adgroup.fields.bidOptimizerId',
    defaultMessage: 'Up. Bid Optimizer ID',
  },
  bid_optimization_objective_type: {
    id: 'adgroup.fields.bidOptimizationObjectiveType',
    defaultMessage: 'Up. Bid Optimization Objective Type',
  },
  bid_optimization_use_user_data: {
    id: 'adgroup.fields.bidOptimizationUseUserData',
    defaultMessage: 'Up. Bid Optimization Use User Data',
  },
  bid_optimization_objective_value: {
    id: 'adgroup.fields.bidOptimizationObjectiveValue',
    defaultMessage: 'Up. Bid Optimization Objective Value',
  },
  viewability_min_score: {
    id: 'adgroup.fields.viewabilityMinScore',
    defaultMessage: 'Up. Viewability Min Score',
  },
  viewability_use_third_party_data: {
    id: 'adgroup.fields.viewabilityUseThirdPartyData',
    defaultMessage: 'Up. Viewability Use Third Party Data',
  },
  ab_selection: {
    id: 'adgroup.fields.abSelection',
    defaultMessage: 'Up. Ab Selection',
  },
  ab_selection_min: {
    id: 'adgroup.fields.abSelectionMin',
    defaultMessage: 'Up. Ab Selection Min',
  },
  ab_selection_max: {
    id: 'adgroup.fields.abSelectionMax',
    defaultMessage: 'Up. Ab Selection Max',
  },
  start_date: {
    id: 'adgroup.fields.startDate',
    defaultMessage: 'Up. Start date',
  },
  end_date: {
    id: 'adgroup.fields.endDate',
    defaultMessage: 'Up. End date',
  },
  max_bid_price: {
    id: 'adgroup.fields.maxBidPrice',
    defaultMessage: 'Up. Max Bid Price',
  },
  per_day_impression_capping: {
    id: 'adgroup.fields.perDayImpressionCapping',
    defaultMessage: 'Up. Daily Impression Capping',
  },
  total_impression_capping: {
    id: 'adgroup.fields.totalImpressionCapping',
    defaultMessage: 'Up. Total Impression Capping',
  },
  budget_relative_to_campaign: {
    id: 'adgroup.fields.budgetRelativeToCampaign',
    defaultMessage: 'Up. Budget Relative To Campaign',
  },
  total_budget: {
    id: 'adgroup.fields.totalBudget',
    defaultMessage: 'Up. Total Budget',
  },
  max_budget_per_period: {
    id: 'adgroup.fields.maxBudgetPerPeriod',
    defaultMessage: 'Up. Budget Split',
  },
  max_budget_period: {
    id: 'adgroup.fields.maxBudgetPeriod',
    defaultMessage: 'Up. Budget Split Period',
  },
  status: {
    id: 'adgroup.fields.status',
    defaultMessage: 'Up. Status',
  },
  targeted_operating_systems: {
    id: 'adgroup.fields.targetedOperatingSystems',
    defaultMessage: 'Up. Operating System',
  },
  targeted_medias: {
    id: 'adgroup.fields.targetedMedias',
    defaultMessage: 'Up. Media Type',
  },
  targeted_devices: {
    id: 'adgroup.fields.targetedDevices',
    defaultMessage: 'Up. Device Type',
  },
  targeted_browser_families: {
    id: 'adgroup.fields.targetedBrowserFamilies',
    defaultMessage: 'Up. Browser',
  },
  targeted_connection_types: {
    id: 'adgroup.fields.targetedConnectionTypes',
    defaultMessage: 'Up. Connection Type',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  duration: {
    id: 'adgroup.fields.duration',
    defaultMessage: 'Up. Duration',
  },


  history_title: {
    id: 'adgroup.resourceHistory.title',
    defaultMessage: 'Up. Ad Group History',
  },
  history_resource_name: {
    id: 'adgroup.resourceHistory.name',
    defaultMessage: 'Up. Ad Group',
  },
});

const adGroupPropertiesFormatMap: {
  [propertyName in keyof AdGroupResource | ExtraKeys | HistoryKeys]: {
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
} = {
  id: { format: 'STRING' },
  name: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  visibility: { format: 'STRING' },
  bid_optimizer_id: { format: 'STRING' },
  bid_optimization_objective_type: { format: 'STRING' },
  bid_optimization_use_user_data: { format: 'STRING' },
  bid_optimization_objective_value: { format: 'STRING' },
  viewability_min_score: { format: 'STRING' },
  viewability_use_third_party_data: { format: 'STRING' },
  ab_selection: { format: 'STRING' },
  ab_selection_min: { format: 'STRING' },
  ab_selection_max: { format: 'STRING' },
  start_date: { format: 'STRING' },
  end_date: { format: 'STRING' },
  max_bid_price: { format: 'STRING' },
  per_day_impression_capping: { format: 'INTEGER' },
  total_impression_capping: { format: 'INTEGER' },
  budget_relative_to_campaign: { format: 'STRING' },
  total_budget: { format: 'FLOAT' },
  max_budget_per_period: { format: 'FLOAT' },
  max_budget_period: {
    format: 'MESSAGE',
    messageMap: budgetPeriodMessages,
  },
  status: { format: 'STRING' },
  targeted_operating_systems: {
    format: 'MESSAGE',
    messageMap: targetedOperatingSystemMessages,
  },
  targeted_medias: {
    format: 'MESSAGE',
    messageMap: targetedMediaMessages,
  },
  targeted_devices: {
    format: 'MESSAGE',
    messageMap: targetedDeviceMessages,
  },
  targeted_browser_families: {
    format: 'MESSAGE',
    messageMap: targetedBrowserFamilyMessages,
  },
  targeted_connection_types: {
    format: 'MESSAGE',
    messageMap: targetedConnectionTypeMessages,
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  duration: { format: 'STRING' },
  history_title: { format: 'STRING' },
  history_resource_name: { format: 'STRING' },
}

function formatAdGroupProperty(property: keyof AdGroupResource | ExtraKeys | HistoryKeys, value?: string): {
  message: FormattedMessage.MessageDescriptor,
  formattedValue?: React.ReactNode,
} {
  return {
    message: adGroupPropertiesMessageMap[property],
    formattedValue: value
      ? formatToFormattingFunction(value, adGroupPropertiesFormatMap[property].format, adGroupPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatAdGroupProperty;
