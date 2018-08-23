import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { DisplayCampaignResource } from "../../../models/campaign/display";
import { BudgetPeriod } from '../../../models/campaign/constants';
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';

const budgetPeriodsMessages: {
  [key in BudgetPeriod]: FormattedMessage.MessageDescriptor
} = defineMessages({
  DAY: {
    id: 'campaign.display.fields.maxBudgetPeriod.day',
    defaultMessage: 'Up. Per Day',
  },
  WEEK: {
    id: 'campaign.display.fields.maxBudgetPeriod.week',
    defaultMessage: 'Up. Per Week',
  },
  MONTH: {
    id: 'campaign.display.fields.maxBudgetPeriod.month',
    defaultMessage: 'Up. Per Month',
  },
});

const campaignPropertiesMessageMap: {
  [propertyName in keyof DisplayCampaignResource | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'campaign.display.fields.id',
    defaultMessage: 'Up. ID',
  },
  organisation_id: {
    id: 'campaign.display.fields.organisationId',
    defaultMessage: 'Up. Organisation ID',
  },
  name: {
    id: 'campaign.display.fields.name',
    defaultMessage: 'Up. Campaign Name',
  },
  creation_ts: {
    id: 'campaign.display.fields.creationTs',
    defaultMessage: 'Up. Creation Timestamp',
  },
  editor_version_id: {
    id: 'campaign.display.fields.editorVersionId',
    defaultMessage: 'Up. Editor Version ID',
  },
  editor_version_value: {
    id: 'campaign.display.fields.editorVersionValue',
    defaultMessage: 'Up. Editor Version Value',
  },
  editor_group_id: {
    id: 'campaign.display.fields.editorGroupId',
    defaultMessage: 'Up. Editor Group ID',
  },
  editor_artifact_id: {
    id: 'campaign.display.fields.editorArtifactId',
    defaultMessage: 'Up. Editor Artifact ID',
  },
  status: {
    id: 'campaign.display.fields.status',
    defaultMessage: 'Up. Status',
  },
  currency_code: {
    id: 'campaign.display.fields.currencyCode',
    defaultMessage: 'Up. Currency Code',
  },
  technical_name: {
    id: 'campaign.display.fields.technicalName',
    defaultMessage: 'Up. Technical Name',
  },
  archived: {
    id: 'campaign.display.fields.archived',
    defaultMessage: 'Up. Archived',
  },
  subtype: {
    id: 'campaign.display.fields.subtype',
    defaultMessage: 'Up. Subtype',
  },
  max_bid_price: {
    id: 'campaign.display.fields.maxBidPrice',
    defaultMessage: 'Up. Max Bid Price',
  },
  total_budget: {
    id: 'campaign.display.fields.totalBudget',
    defaultMessage: 'Up. Total Budget',
  },
  max_budget_per_period: {
    id: 'campaign.display.fields.maxBudgetPerPeriod',
    defaultMessage: 'Up. Budget Split',
  },
  max_budget_period: {
    id: 'campaign.display.fields.maxBudgetPeriod',
    defaultMessage: 'Up. Budget Split Period',
  },
  total_impression_capping: {
    id: 'campaign.display.fields.totalImpressionCapping',
    defaultMessage: 'Up. Total Impression Capping',
  },
  per_day_impression_capping: {
    id: 'campaign.display.fields.perDayImpressionCapping',
    defaultMessage: 'Up. Daily Impression Capping',
  },
  start_date: {
    id: 'campaign.display.fields.startDate',
    defaultMessage: 'Up. Start Date',
  },
  end_date: {
    id: 'campaign.display.fields.endDate',
    defaultMessage: 'Up. End Date',
  },
  time_zone: {
    id: 'campaign.display.fields.timeZone',
    defaultMessage: 'Up. Time Zone',
  },
  model_version: {
    id: 'campaign.display.fields.modelVersion',
    defaultMessage: 'Up. Model Version',
  },
  type: {
    id: 'campaign.display.fields.type',
    defaultMessage: 'Up. Type',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'campaign.resourceHistory.title',
    defaultMessage: 'Up. Campaign History',
  },
  history_resource_name: {
    id: 'campaign.resourceHistory.name',
    defaultMessage: 'Up. Campaign',
  },
});

const campaignPropertiesFormatMap: {
  [propertyName in keyof DisplayCampaignResource | HistoryKeys]: {
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
} = {
  id: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  name: { format: 'STRING' },
  creation_ts: { format: 'STRING' },
  editor_version_id: { format: 'STRING' },
  editor_version_value: { format: 'STRING' },
  editor_group_id: { format: 'STRING' },
  editor_artifact_id: { format: 'STRING' },
  status: { format: 'STRING' },
  currency_code: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  archived: { format: 'STRING' },
  subtype: { format: 'STRING' },
  max_bid_price: { format: 'STRING' },
  total_budget: { format: 'FLOAT' },
  max_budget_per_period: { format: 'FLOAT' },
  max_budget_period: {
    format: 'MESSAGE',
    messageMap: budgetPeriodsMessages,
  },
  total_impression_capping: { format: 'INTEGER' },
  per_day_impression_capping: { format: 'INTEGER' },
  start_date: { format: 'STRING' },
  end_date: { format: 'STRING' },
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
    formattedValue: value
      ? formatToFormattingFunction(value, campaignPropertiesFormatMap[property].format, campaignPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatCampaignProperty;
