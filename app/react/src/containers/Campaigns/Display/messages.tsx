import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  AdGroupResource,
  DisplayCampaignResource,
} from '../../../models/campaign/display';
import {
  HistoryKeys,
  formatToFormattingFunction,
  ValueFormat,
} from '../../ResourceHistory/utils';
import {
  BudgetPeriod,
  TargetedMedia,
  TargetedDevice,
  TargetedOperatingSystem,
  TargetedBrowserFamily,
  TargetedConnectionType,
  AdGroupStatus,
  AdSlotVisibilityFilter,
  CampaignStatus,
  DisplayCampaignSubType,
} from '../../../models/campaign/constants';

export const messages = defineMessages({
  id: {
    id: 'display.metrics.id',
    defaultMessage: 'Id',
  },
  status: {
    id: 'display.metrics.status',
    defaultMessage: 'Status',
  },
  name: {
    id: 'display.metrics.name',
    defaultMessage: 'Name',
  },
  technicalName: {
    id: 'display.metrics.technicalName',
    defaultMessage: 'Technical Name',
  },
  impressions: {
    id: 'display.metrics.impressions',
    defaultMessage: 'Imp.',
  },
  cpm: {
    id: 'display.metrics.cpm',
    defaultMessage: 'CPM',
  },
  cpa: {
    id: 'display.metrics.cpa',
    defaultMessage: 'CPA',
  },
  ctr: {
    id: 'display.metrics.ctr',
    defaultMessage: 'CTR',
  },
  cpc: {
    id: 'display.metrics.cpc',
    defaultMessage: 'CPC',
  },
  weightedConversion: {
    id: 'display.metrics.weightedConversion',
    defaultMessage: 'Weighted Conversions',
  },
  interactionToConversionDuration: {
    id: 'display.metrics.interaction_to_conversion_duration',
    defaultMessage: 'Interaction To Conversion Duration',
  },
  impressionCost: {
    id: 'display.metrics.impressions_cost',
    defaultMessage: 'Spent',
  },
  clicks: {
    id: 'display.metrics.clicks',
    defaultMessage: 'Clicks',
  },
  display_network_name: {
    id: 'display.metrics.display_network_name',
    defaultMessage: 'Display Network Name',
  },
  formats: {
    id: 'display.metrics.formats',
    defaultMessage: 'Formats',
  },
  duplication: {
    id: 'display.duplication',
    defaultMessage: 'Duplicate',
  },
  filterByLabel: {
    id: 'display.filterByLabel',
    defaultMessage: 'Filter by Label',
  },
  savingInProgress: {
    id: 'edit.campaigns.loading.message',
    defaultMessage: 'Saving in progress',
  },
  campaignsArchived: {
    id: 'archive.campaigns.success.msg',
    defaultMessage: 'Campaigns successfully archived',
  },
  campaignsSaved: {
    id: 'save.campaigns.success.msg',
    defaultMessage: 'Campaigns successfully saved',
  },
  editionNotAllowed: {
    id: 'display.campaigns.table.edition.not.allowed',
    defaultMessage:
      'Edition on this campaign is deprecated, you must use navigator legacy to edit this campaign',
  },
  creativeName: {
    id: 'campaignEditor.export.adserver.creativeName',
    defaultMessage: 'Creative Name',
  },
  snippet: {
    id: 'campaignEditor.export.adserver.snippet',
    defaultMessage: 'Snippet',
  },
  confirmArchiveModalTitle: {
    id: 'campaign.display.archive.confirmModal.title',
    defaultMessage: 'Are you sure you want to archive this Campaign ?',
  },
  confirmArchiveModalContent: {
    id: 'campaign.display.archive.confirmModal.content',
    defaultMessage:
      "By archiving this Campaign all its activities will be suspended. You'll be able to recover it from the archived campaign filter.",
  },
  confirmArchiveModalOk: {
    id: 'campaign.display.archive.confirmModal.ok',
    defaultMessage: 'Archive now',
  },
  confirmArchiveModalCancel: {
    id: 'campaign.display.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchDisplayCampaign: {
    id: 'campaign.display.list.search.placeholder',
    defaultMessage: 'Search Display Campaigns',
  },
  editDisplayCampaign: {
    id: 'campaign.display.list.action.edit',
    defaultMessage: 'Edit',
  },
  archiveDisplayCampaign: {
    id: 'campaign.display.list.action.archive',
    defaultMessage: 'Archive',
  },
  displayCampaignsExportTitle: {
    id: 'campaign.display.list.actionbar.exportTitle',
    defaultMessage: 'Display Campaigns Export',
  },
  fetchReportError: {
    id: 'campaign.display.error.fetch-report',
    defaultMessage: 'Cannot load campaign statistics',
  },
});

type ExtraKeys = 'duration';

const visibilityMessages: {
  [key in AdSlotVisibilityFilter]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ABOVE_THE_FOLD: {
    id: 'adgroup.fields.visibility.aboveTheFold',
    defaultMessage: 'Above the fold',
  },
  BELOW_THE_FOLD: {
    id: 'adgroup.fields.visibility.belowTheFold',
    defaultMessage: 'Below the fold',
  },
  ANY_POSITION: {
    id: 'adgroup.fields.visibility.anyPosition',
    defaultMessage: 'Any Position',
  },
});

const budgetPeriodMessages: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor;
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
  [key in AdGroupStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ACTIVE: {
    id: 'adgroup.fields.status.active',
    defaultMessage: 'Active',
  },
  PENDING: {
    id: 'adgroup.fields.status.pending',
    defaultMessage: 'Pending',
  },
  PAUSED: {
    id: 'adgroup.fields.status.paused',
    defaultMessage: 'Paused',
  },
});

const targetedOperatingSystemMessages: {
  [key in TargetedOperatingSystem]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedOperatingSystems.all',
    defaultMessage: 'All',
  },
  IOS: {
    id: 'adgroup.fields.targetedOperatingSystems.ios',
    defaultMessage: 'iOS',
  },
  ANDROID: {
    id: 'adgroup.fields.targetedOperatingSystems.android',
    defaultMessage: 'Android',
  },
  WINDOWS_PHONE: {
    id: 'adgroup.fields.targetedOperatingSystems.windowsPhone',
    defaultMessage: 'Windows Phone',
  },
});

const targetedMediaMessages: {
  [key in TargetedMedia]: FormattedMessage.MessageDescriptor;
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

const targetedDeviceMessages: {
  [key in TargetedDevice]: FormattedMessage.MessageDescriptor;
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
  },
});

const targetedBrowserFamilyMessages: {
  [key in TargetedBrowserFamily]: FormattedMessage.MessageDescriptor;
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

const targetedConnectionTypeMessages: {
  [key in TargetedConnectionType]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ALL: {
    id: 'adgroup.fields.targetedConnectionTypes.all',
    defaultMessage: 'All',
  },
  ETHERNET: {
    id: 'adgroup.fields.targetedConnectionTypes.ethernet',
    defaultMessage: 'Ethernet',
  },
  WIFI: {
    id: 'adgroup.fields.targetedConnectionTypes.wifi',
    defaultMessage: 'Wifi',
  },
  CELLULAR_NETWORK_2G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork2G',
    defaultMessage: '2G',
  },
  CELLULAR_NETWORK_3G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork3G',
    defaultMessage: '3G',
  },
  CELLULAR_NETWORK_4G: {
    id: 'adgroup.fields.targetedConnectionTypes.cellularNetwork4G',
    defaultMessage: '4G',
  },
});

const adGroupPropertiesMessageMap: {
  [propertyName in
    | keyof AdGroupResource
    | ExtraKeys
    | HistoryKeys]: FormattedMessage.MessageDescriptor;
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
  history_resource_type: {
    id: 'adgroup.resourceHistory.type',
    defaultMessage: 'Ad Group',
  },
});

const adGroupPropertiesFormatMap: {
  [propertyName in keyof AdGroupResource | ExtraKeys | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: FormattedMessage.MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  name: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  visibility: {
    format: 'MESSAGE',
    messageMap: visibilityMessages,
  },
  bid_optimizer_id: { format: 'STRING' },
  bid_optimization_objective_type: { format: 'STRING' },
  bid_optimization_use_user_data: { format: 'STRING' },
  bid_optimization_objective_value: { format: 'STRING' },
  viewability_min_score: { format: 'INTEGER' },
  viewability_use_third_party_data: { format: 'STRING' },
  ab_selection: { format: 'STRING' },
  ab_selection_min: { format: 'INTEGER' },
  ab_selection_max: { format: 'INTEGER' },
  start_date: { format: 'TIMESTAMP' },
  end_date: { format: 'TIMESTAMP' },
  max_bid_price: { format: 'FLOAT' },
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
  history_resource_type: { format: 'STRING' },
};

export const formatAdGroupProperty = (
  property: keyof AdGroupResource | ExtraKeys | HistoryKeys,
  value?: string,
): {
  message: FormattedMessage.MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: adGroupPropertiesMessageMap[property],
    formattedValue:
      value && adGroupPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            adGroupPropertiesFormatMap[property].format,
            adGroupPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};

const displayCampaignSubtypeMessages: {
  [key in DisplayCampaignSubType]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  PROGRAMMATIC: {
    id: 'campaign.display.fields.subtype.programmatic',
    defaultMessage: 'Programmatic',
  },
  AD_SERVING: {
    id: 'campaign.display.fields.subtype.adServing',
    defaultMessage: 'Ad Serving',
  },
  TRACKING: {
    id: 'campaign.display.fields.subtype.tracking',
    defaultMessage: 'Tracking',
  },
});

const campaignStatusMessages: {
  [key in CampaignStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ACTIVE: {
    id: 'campaign.display.fields.status.active',
    defaultMessage: 'Active',
  },
  PENDING: {
    id: 'campaign.display.fields.status.pending',
    defaultMessage: 'Pending',
  },
  PAUSED: {
    id: 'campaign.display.fields.status.paused',
    defaultMessage: 'Paused',
  },
  ARCHIVED: {
    id: 'campaign.display.fields.status.archived',
    defaultMessage: 'Archived',
  },
});

const campaignPropertiesMessageMap: {
  [propertyName in
    | keyof DisplayCampaignResource
    | HistoryKeys]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  id: {
    id: 'campaign.display.fields.id',
    defaultMessage: 'ID',
  },
  organisation_id: {
    id: 'campaign.display.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  name: {
    id: 'campaign.display.fields.name',
    defaultMessage: 'Campaign Name',
  },
  creation_ts: {
    id: 'campaign.display.fields.creationTs',
    defaultMessage: 'Creation Timestamp',
  },
  editor_version_id: {
    id: 'campaign.display.fields.editorVersionId',
    defaultMessage: 'Editor Version ID',
  },
  editor_version_value: {
    id: 'campaign.display.fields.editorVersionValue',
    defaultMessage: 'Editor Version Value',
  },
  editor_group_id: {
    id: 'campaign.display.fields.editorGroupId',
    defaultMessage: 'Editor Group ID',
  },
  editor_artifact_id: {
    id: 'campaign.display.fields.editorArtifactId',
    defaultMessage: 'Editor Artifact ID',
  },
  status: {
    id: 'campaign.display.fields.status',
    defaultMessage: 'Status',
  },
  currency_code: {
    id: 'campaign.display.fields.currencyCode',
    defaultMessage: 'Currency Code',
  },
  technical_name: {
    id: 'campaign.display.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  archived: {
    id: 'campaign.display.fields.archived',
    defaultMessage: 'Archived',
  },
  subtype: {
    id: 'campaign.display.fields.subtype',
    defaultMessage: 'Subtype',
  },
  max_bid_price: {
    id: 'campaign.display.fields.maxBidPrice',
    defaultMessage: 'Max Bid Price',
  },
  total_budget: {
    id: 'campaign.display.fields.totalBudget',
    defaultMessage: 'Total Budget',
  },
  max_budget_per_period: {
    id: 'campaign.display.fields.maxBudgetPerPeriod',
    defaultMessage: 'Budget Split',
  },
  max_budget_period: {
    id: 'campaign.display.fields.maxBudgetPeriod',
    defaultMessage: 'Budget Split Period',
  },
  total_impression_capping: {
    id: 'campaign.display.fields.totalImpressionCapping',
    defaultMessage: 'Total Impression Capping',
  },
  per_day_impression_capping: {
    id: 'campaign.display.fields.perDayImpressionCapping',
    defaultMessage: 'Daily Impression Capping',
  },
  start_date: {
    id: 'campaign.display.fields.startDate',
    defaultMessage: 'Start Date',
  },
  end_date: {
    id: 'campaign.display.fields.endDate',
    defaultMessage: 'End Date',
  },
  time_zone: {
    id: 'campaign.display.fields.timeZone',
    defaultMessage: 'Time Zone',
  },
  model_version: {
    id: 'campaign.display.fields.modelVersion',
    defaultMessage: 'Model Version',
  },
  type: {
    id: 'campaign.display.fields.type',
    defaultMessage: 'Type',
  },
  automated: {
    id: 'campaign.display.fields.automated',
    defaultMessage: 'Automated',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'campaign.display.resourceHistory.title',
    defaultMessage: 'Display Campaign History',
  },
  history_resource_type: {
    id: 'campaign.display.resourceHistory.type',
    defaultMessage: 'Display Campaign',
  },
});

const campaignPropertiesFormatMap: {
  [propertyName in keyof DisplayCampaignResource | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: FormattedMessage.MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  name: { format: 'STRING' },
  creation_ts: { format: 'TIMESTAMP' },
  editor_version_id: { format: 'STRING' },
  editor_version_value: { format: 'STRING' },
  editor_group_id: { format: 'STRING' },
  editor_artifact_id: { format: 'STRING' },
  status: {
    format: 'MESSAGE',
    messageMap: campaignStatusMessages,
  },
  currency_code: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  archived: { format: 'STRING' },
  subtype: {
    format: 'MESSAGE',
    messageMap: displayCampaignSubtypeMessages,
  },
  max_bid_price: { format: 'FLOAT' },
  total_budget: { format: 'FLOAT' },
  max_budget_per_period: { format: 'FLOAT' },
  max_budget_period: {
    format: 'MESSAGE',
    messageMap: budgetPeriodMessages,
  },
  total_impression_capping: { format: 'INTEGER' },
  per_day_impression_capping: { format: 'INTEGER' },
  start_date: { format: 'TIMESTAMP' },
  end_date: { format: 'TIMESTAMP' },
  time_zone: { format: 'STRING' },
  model_version: { format: 'STRING' },
  type: { format: 'STRING' },
  automated: { format: 'STRING' },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
};

export const formatDisplayCampaignProperty = (
  property: keyof DisplayCampaignResource | HistoryKeys,
  value?: string,
): {
  message: FormattedMessage.MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: campaignPropertiesMessageMap[property],
    formattedValue:
      value && campaignPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            campaignPropertiesFormatMap[property].format,
            campaignPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};
