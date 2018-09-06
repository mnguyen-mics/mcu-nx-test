import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { DisplayCampaignResource } from "../../../models/campaign/display";
import { BudgetPeriod, CampaignStatus } from '../../../models/campaign/constants';
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';

const budgetPeriodMessages: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor
} = defineMessages({
  DAY: {
    id: 'campaign.display.fields.maxBudgetPeriod.day',
    defaultMessage: 'Per Day',
  },
  WEEK: {
    id: 'campaign.display.fields.maxBudgetPeriod.week',
    defaultMessage: 'Per Week',
  },
  MONTH: {
    id: 'campaign.display.fields.maxBudgetPeriod.month',
    defaultMessage: 'Per Month',
  },
});

const campaignStatusMessages: {
  [key in CampaignStatus]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ACTIVE: {
    id: 'campaign.display.fields.status.active',
    defaultMessage: 'Active'
  },
  PENDING: {
    id: 'campaign.display.fields.status.pending',
    defaultMessage: 'Pending'
  },
  PAUSED: {
    id: 'campaign.display.fields.status.paused',
    defaultMessage: 'Paused'
  },
  ARCHIVED: {
    id: 'campaign.display.fields.status.archived',
    defaultMessage: 'Archived'
  },
});

const campaignPropertiesMessageMap: {
  [propertyName in keyof DisplayCampaignResource | HistoryKeys]: FormattedMessage.MessageDescriptor
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
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'campaign.resourceHistory.title',
    defaultMessage: 'Display Campaign History',
  },
  history_resource_name: {
    id: 'campaign.resourceHistory.name',
    defaultMessage: 'Display Campaign',
  },
});

const campaignPropertiesFormatMap: {
  [propertyName in keyof DisplayCampaignResource | HistoryKeys]: {
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
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
  subtype: { format: 'STRING' },
  max_bid_price: { format: 'STRING' },
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
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_name: { format: 'STRING' },
}

function formatCampaignProperty(property: keyof DisplayCampaignResource | HistoryKeys, value?: string): {
  message: FormattedMessage.MessageDescriptor,
  formattedValue?: React.ReactNode,
} {
  return {
    message: campaignPropertiesMessageMap[property],
    formattedValue: (value && campaignPropertiesFormatMap[property])
      ? formatToFormattingFunction(value, campaignPropertiesFormatMap[property].format, campaignPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatCampaignProperty;
