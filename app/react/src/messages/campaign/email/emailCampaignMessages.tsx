import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';
import { EmailCampaignResource } from '../../../models/campaign/email';
import { CampaignStatus } from '../../../models/campaign';


const emailCampaignStatusMessages: {
  [key in CampaignStatus]: FormattedMessage.MessageDescriptor
} = defineMessages({
  ACTIVE: {
    id: 'campaign.email.fields.status.active',
    defaultMessage: 'Active'
  },
  PENDING: {
    id: 'campaign.email.fields.status.pending',
    defaultMessage: 'Pending'
  },
  PAUSED: {
    id: 'campaign.email.fields.status.paused',
    defaultMessage: 'Paused'
  },
  ARCHIVED: {
    id: 'campaign.email.fields.status.archived',
    defaultMessage: 'Archived'
  },
});

const emailCampaignPropertiesMessageMap: {
  [propertyName in keyof EmailCampaignResource | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'campaign.email.fields.id',
    defaultMessage: 'ID',
  },
  status: {
    id: 'campaign.email.fields.status',
    defaultMessage: 'Status',
  },
  archived: {
    id: 'campaign.email.fields.archived',
    defaultMessage: 'Archived',
  },
  organisation_id: {
    id: 'campaign.email.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  name: {
    id: 'campaign.email.fields.name',
    defaultMessage: 'Name',
  },
  creation_ts: {
    id: 'campaign.email.fields.creationTs',
    defaultMessage: 'Creation Timestamp',
  },
  editor_versionid: {
    id: 'campaign.email.fields.editorVersionId',
    defaultMessage: 'Editor Version ID',
  },
  editor_version_value: {
    id: 'campaign.email.fields.editorVersionValue',
    defaultMessage: 'Editor Version Value',
  },
  editor_groupid: {
    id: 'campaign.email.fields.editorGroupId',
    defaultMessage: 'Editor Group ID',
  },
  editor_artifact_id: {
    id: 'campaign.email.fields.editorArtifactId',
    defaultMessage: 'Editor Artifact ID',
  },
  currency_code: {
    id: 'campaign.email.fields.currencyCode',
    defaultMessage: 'Currency Code',
  },
  technical_name: {
    id: 'campaign.email.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  type: {
    id: 'campaign.email.fields.type',
    defaultMessage: 'Type',
  },
  automated: {
    id: 'campaign.email.fields.automated',
    defaultMessage: 'Automated',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'campaign.email.resourceHistory.title',
    defaultMessage: 'Email Campaign History',
  },
  history_resource_type: {
    id: 'campaign.email.resourceHistory.type',
    defaultMessage: 'Email Campaign',
  },
});

const emailCampaignPropertiesFormatMap: {
  [propertyName in keyof EmailCampaignResource | HistoryKeys]: {
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
} = {
  id: { format: 'STRING' },
  status: {
    format: 'MESSAGE',
    messageMap: emailCampaignStatusMessages,
  },
  archived: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  name: { format: 'STRING' },
  creation_ts: { format: 'TIMESTAMP' },
  editor_versionid: { format: 'STRING' },
  editor_version_value: { format: 'STRING' },
  editor_groupid: { format: 'STRING' },
  editor_artifact_id: { format: 'STRING' },
  currency_code: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  type: { format: 'STRING' },
  automated: { format: "STRING" },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
}

function formatCampaignProperty(property: keyof EmailCampaignResource | HistoryKeys, value?: string): {
  message: FormattedMessage.MessageDescriptor,
  formattedValue?: React.ReactNode,
} {
  return {
    message: emailCampaignPropertiesMessageMap[property],
    formattedValue: (value && emailCampaignPropertiesFormatMap[property])
      ? formatToFormattingFunction(value, emailCampaignPropertiesFormatMap[property].format, emailCampaignPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatCampaignProperty;
