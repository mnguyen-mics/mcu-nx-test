import { defineMessages, FormattedMessage } from "react-intl";
import { AdGroupResource } from "../../../models/campaign/display";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';
import {
  BudgetPeriod,
  TargetedMedia,
  TargetedDevice,
  TargetedOperatingSystem,
  TargetedBrowserFamily,
  TargetedConnectionType,
  AdGroupStatus
} from "../../../models/campaign/constants";

type ExtraKeys = 'duration';

const budgetPeriodMessages: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor
} = defineMessages({
  DAY: {
    id: 'adgroup.fields.maxBudgetPeriod.day',
    defaultMessage: 'Per Day',
  },
  WEEK: {
    id: 'adgroup.fields.maxBudgetPeriod.week',
    defaultMessage: 'Per Week',
  },
  MONTH: {
    id: 'adgroup.fields.maxBudgetPeriod.month',
    defaultMessage: 'Per Month',
  },
});

const adGroupStatusMessages: {
  [key in AdGroupStatus]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ACTIVE: {
    id: 'adgroup.fields.status.active',
    defaultMessage: 'Active'
  },
  PENDING: {
    id: 'adgroup.fields.status.pending',
    defaultMessage: 'Pending'
  },
  PAUSED: {
    id: 'adgroup.fields.status.paused',
    defaultMessage: 'Paused'
  },
});

const targetedOperatingSystemMessages: {
  [key in TargetedOperatingSystem]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedOperatingSystems.all',
    defaultMessage: 'All'
  },
  IOS: {
    id: 'adgroup.fields.targetedOperatingSystems.ios',
    defaultMessage: 'iOS'
  },
  ANDROID: {
    id: 'adgroup.fields.targetedOperatingSystems.android',
    defaultMessage: 'Android'
  },
  WINDOWS_PHONE: {
    id: 'adgroup.fields.targetedOperatingSystems.windowsPhone',
    defaultMessage: 'Windows Phone'
  },
});

const targetedMediaMessages: {
  [key in TargetedMedia]: FormattedMessage.MessageDescriptor
} = defineMessages({
  WEB: {
    id: 'adgroup.fields.targetedMedias.web',
    defaultMessage: 'Website',
  },
  MOBILE_APP: {
    id: 'adgroup.fields.targetedMedias.mobileApp',
    defaultMessage: 'Mobile App',
  },
});

const targetedDeviceMessages : {
  [key in TargetedDevice]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedDevices.all',
    defaultMessage: 'All',
  },
  ONLY_DESKTOP: {
    id: 'adgroup.fields.targetedDevices.onlyDesktop',
    defaultMessage: 'Desktop',
  },
  ONLY_MOBILE: {
    id: 'adgroup.fields.targetedDevices.onlyMobile',
    defaultMessage: 'Mobile',
  },
  ONLY_TABLET: {
    id: 'adgroup.fields.targetedDevices.onlyTablet',
    defaultMessage: 'Tablet',
  },
  MOBILE_AND_TABLET: {
    id: 'adgroup.fields.targetedDevices.mobileAndTablet',
    defaultMessage: 'Mobile and Tablet',
  }
});

const targetedBrowserFamilyMessages : {
  [key in TargetedBrowserFamily]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedBrowserFamilies.all',
    defaultMessage: 'All',
  },
  CHROME: {
    id: 'adgroup.fields.targetedBrowserFamilies.chrome',
    defaultMessage: 'Chrome',
  },
  INTERNET_EXPLORER: {
    id: 'adgroup.fields.targetedBrowserFamilies.internetExplorer',
    defaultMessage: 'Internet Explorer',
  },
  MICROSOFT_EDGE: {
    id: 'adgroup.fields.targetedBrowserFamilies.microsoftEdge',
    defaultMessage: 'Microsoft Edge',
  },
  FIREFOX: {
    id: 'adgroup.fields.targetedBrowserFamilies.firefox',
    defaultMessage: 'Firefox',
  },
  SAFARI: {
    id: 'adgroup.fields.targetedBrowserFamilies.safari',
    defaultMessage: 'Safari',
  },
  OPERA: {
    id: 'adgroup.fields.targetedBrowserFamilies.opera',
    defaultMessage: 'Opera',
  },
});

const targetedConnectionTypeMessages : {
  [key in TargetedConnectionType]: FormattedMessage.MessageDescriptor  
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedConnectionTypes.all',
    defaultMessage: 'All'
  },
  ETHERNET: {
    id: 'adgroup.fields.targetedConnectionTypes.ethernet',
    defaultMessage: 'Ethernet'
  },
  WIFI: {
    id: 'adgroup.fields.targetedConnectionTypes.wifi',
    defaultMessage: 'Wifi'
  },
  CELLULAR_NETWORK_2G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork2G',
    defaultMessage: '2G'
  },
  CELLULAR_NETWORK_3G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork3G',
    defaultMessage: '3G'
  },
  CELLULAR_NETWORK_4G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork4G',
    defaultMessage: '4G'
  },
});

const adGroupPropertiesMessageMap: {
  [propertyName in keyof AdGroupResource | ExtraKeys | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'adgroup.fields.id',
    defaultMessage: 'ID',
  },
  name: {
    id: 'adgroup.fields.name',
    defaultMessage: 'Ad Group Name',
  },
  technical_name: {
    id: 'adgroup.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  visibility: {
    id: 'adgroup.fields.visibility',
    defaultMessage: 'Visibility',
  },
  bid_optimizer_id: {
    id: 'adgroup.fields.bidOptimizerId',
    defaultMessage: 'Bid Optimizer ID',
  },
  bid_optimization_objective_type: {
    id: 'adgroup.fields.bidOptimizationObjectiveType',
    defaultMessage: 'Bid Optimization Objective Type',
  },
  bid_optimization_use_user_data: {
    id: 'adgroup.fields.bidOptimizationUseUserData',
    defaultMessage: 'Bid Optimization Use User Data',
  },
  bid_optimization_objective_value: {
    id: 'adgroup.fields.bidOptimizationObjectiveValue',
    defaultMessage: 'Bid Optimization Objective Value',
  },
  viewability_min_score: {
    id: 'adgroup.fields.viewabilityMinScore',
    defaultMessage: 'Viewability Min Score',
  },
  viewability_use_third_party_data: {
    id: 'adgroup.fields.viewabilityUseThirdPartyData',
    defaultMessage: 'Viewability Use Third Party Data',
  },
  ab_selection: {
    id: 'adgroup.fields.abSelection',
    defaultMessage: 'Ab Selection',
  },
  ab_selection_min: {
    id: 'adgroup.fields.abSelectionMin',
    defaultMessage: 'Ab Selection Min',
  },
  ab_selection_max: {
    id: 'adgroup.fields.abSelectionMax',
    defaultMessage: 'Ab Selection Max',
  },
  start_date: {
    id: 'adgroup.fields.startDate',
    defaultMessage: 'Start date',
  },
  end_date: {
    id: 'adgroup.fields.endDate',
    defaultMessage: 'End date',
  },
  max_bid_price: {
    id: 'adgroup.fields.maxBidPrice',
    defaultMessage: 'Max Bid Price',
  },
  per_day_impression_capping: {
    id: 'adgroup.fields.perDayImpressionCapping',
    defaultMessage: 'Daily Impression Capping',
  },
  total_impression_capping: {
    id: 'adgroup.fields.totalImpressionCapping',
    defaultMessage: 'Total Impression Capping',
  },
  budget_relative_to_campaign: {
    id: 'adgroup.fields.budgetRelativeToCampaign',
    defaultMessage: 'Budget Relative To Campaign',
  },
  total_budget: {
    id: 'adgroup.fields.totalBudget',
    defaultMessage: 'Total Budget',
  },
  max_budget_per_period: {
    id: 'adgroup.fields.maxBudgetPerPeriod',
    defaultMessage: 'Budget Split',
  },
  max_budget_period: {
    id: 'adgroup.fields.maxBudgetPeriod',
    defaultMessage: 'Budget Split Period',
  },
  status: {
    id: 'adgroup.fields.status',
    defaultMessage: 'Status',
  },
  targeted_operating_systems: {
    id: 'adgroup.fields.targetedOperatingSystems',
    defaultMessage: 'Operating System',
  },
  targeted_medias: {
    id: 'adgroup.fields.targetedMedias',
    defaultMessage: 'Media Type',
  },
  targeted_devices: {
    id: 'adgroup.fields.targetedDevices',
    defaultMessage: 'Device Type',
  },
  targeted_browser_families: {
    id: 'adgroup.fields.targetedBrowserFamilies',
    defaultMessage: 'Browser',
  },
  targeted_connection_types: {
    id: 'adgroup.fields.targetedConnectionTypes',
    defaultMessage: 'Connection Type',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  duration: {
    id: 'adgroup.fields.duration',
    defaultMessage: 'Duration',
  },


  history_title: {
    id: 'adgroup.resourceHistory.title',
    defaultMessage: 'Ad Group History',
  },
  history_resource_name: {
    id: 'adgroup.resourceHistory.name',
    defaultMessage: 'Ad Group',
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
  status: {
    format: 'MESSAGE',
    messageMap: adGroupStatusMessages,
  },
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
    formattedValue: (value && adGroupPropertiesFormatMap[property])
      ? formatToFormattingFunction(value, adGroupPropertiesFormatMap[property].format, adGroupPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatAdGroupProperty;
