import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { DisplayCampaignResource } from "../../../models/campaign/display";
import { formatMetric } from "../../../utils/MetricHelper";
import { BudgetPeriod } from '../../../models/campaign/constants';

const budgetPeriodsMessages: {
  [propertyName: string]: FormattedMessage.MessageDescriptor
} = defineMessages({
  max_budget_period_day: {
    id: 'campaign.display.fields.maxBudgetPeriod.day',
    defaultMessage: 'DAY',
  },
  max_budget_period_week: {
    id: 'campaign.display.fields.maxBudgetPeriod.week',
    defaultMessage: 'WEEK',
  },
  max_budget_period_month: {
    id: 'campaign.display.fields.maxBudgetPeriod.month',
    defaultMessage: 'MONTH',
  },
});

const formatMaxBudgetPeriod = (value: BudgetPeriod) => {
  switch (value) {
    case 'DAY':
      return budgetPeriodsMessages.max_budget_period_day;
    case 'WEEK': 
      return budgetPeriodsMessages.max_budget_period_week;
    case 'MONTH':
      return budgetPeriodsMessages.max_budget_period_month;
  }
};

const campaignPropertiesMessageMap: {
  [propertyName in keyof DisplayCampaignResource | 'historyTitle' | 'historyResourceName']: FormattedMessage.MessageDescriptor
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
  historyTitle: {
    id: 'campaign.resourcehistory.title',
    defaultMessage: 'Campaign History',
  },
  historyResourceName: {
    id: 'campaign.resourcehistory.name',
    defaultMessage: 'Campaign',
  },
});

const campaignPropertiesFormattingMap: {
  [propertyName in keyof DisplayCampaignResource | 'historyTitle' | 'historyResourceName']: {
    message: FormattedMessage.MessageDescriptor,
    formatValue: (value: string | number | BudgetPeriod) => React.ReactNode,
  }
} = {
  id: {
    message: campaignPropertiesMessageMap.id,
    formatValue: val => val,
  },
  organisation_id: {
    message: campaignPropertiesMessageMap.organisation_id,
    formatValue: val => val,
  },
  name: {
    message: campaignPropertiesMessageMap.name,
    formatValue: val => val,
  },
  creation_ts: {
    message: campaignPropertiesMessageMap.creation_ts,
    formatValue: val => val,
  },
  editor_version_id: {
    message: campaignPropertiesMessageMap.editor_version_id,
    formatValue: val => val,
  },
  editor_version_value: {
    message: campaignPropertiesMessageMap.editor_version_value,
    formatValue: val => val,
  },
  editor_group_id: {
    message: campaignPropertiesMessageMap.editor_group_id,
    formatValue: val => val,
  },
  editor_artifact_id: {
    message: campaignPropertiesMessageMap.editor_artifact_id,
    formatValue: val => val,
  },
  status: {
    message: campaignPropertiesMessageMap.status,
    formatValue: val => val,
  },
  currency_code: {
    message: campaignPropertiesMessageMap.currency_code,
    formatValue: val => val,
  },
  technical_name: {
    message: campaignPropertiesMessageMap.technical_name,
    formatValue: val => val,
  },
  archived: {
    message: campaignPropertiesMessageMap.archived,
    formatValue: val => val,
  },
  subtype: {
    message: campaignPropertiesMessageMap.subtype,
    formatValue: val => val,
  },
  max_bid_price: {
    message: campaignPropertiesMessageMap.max_bid_price,
    formatValue: val => val,
  },
  total_budget: {
    message: campaignPropertiesMessageMap.total_budget,
    formatValue: val => formatMetric(val, '0.00'),
  },
  max_budget_per_period: {
    message: campaignPropertiesMessageMap.max_budget_per_period,
    formatValue: val => formatMetric(val, '0.00'),
  },
  max_budget_period: {
    message: campaignPropertiesMessageMap.max_budget_period,
    formatValue: val => <FormattedMessage {...formatMaxBudgetPeriod(val as BudgetPeriod)}/>,
  },
  total_impression_capping: {
    message: campaignPropertiesMessageMap.total_impression_capping,
    formatValue: val => formatMetric(val, '0'),
  },
  per_day_impression_capping: {
    message: campaignPropertiesMessageMap.per_day_impression_capping,
    formatValue: val => formatMetric(val, '0'),
  },
  start_date: {
    message: campaignPropertiesMessageMap.start_date,
    formatValue: val => val,
  },
  end_date: {
    message: campaignPropertiesMessageMap.end_date,
    formatValue: val => val,
  },
  time_zone: {
    message: campaignPropertiesMessageMap.time_zone,
    formatValue: val => val,
  },
  model_version: {
    message: campaignPropertiesMessageMap.model_version,
    formatValue: val => val,
  },
  type: {
    message: campaignPropertiesMessageMap.type,
    formatValue: val => val,
  },

  /*
  ==============================================================================
  ============================== RESOURCE HISTORY ==============================
  ==============================================================================
  */
  historyTitle: {
    message: campaignPropertiesMessageMap.historyTitle,
    formatValue: val => val,
  },
  historyResourceName: {
    message: campaignPropertiesMessageMap.historyResourceName,
    formatValue: val => val,
  },
};


export default campaignPropertiesFormattingMap;
