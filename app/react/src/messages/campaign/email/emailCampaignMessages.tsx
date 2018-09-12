import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';
import { EmailCampaignResource } from '../../../models/campaign/email';


const emailCampaignPropertiesMessageMap: {
  [propertyName in keyof EmailCampaignResource | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'emailCampaign.fields.id',
    defaultMessage: 'ID',
  },
  status: {
    id: 'emailCampaign.fields.status',
    defaultMessage: 'Status',
  },
  archived: {
    id: 'emailCampaign.fields.archived',
    defaultMessage: 'Archived',
  },
  organisation_id: {
    id: 'emailCampaign.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  name: {
    id: 'emailCampaign.fields.name',
    defaultMessage: 'Name',
  },
  creation_ts: {
    id: 'emailCampaign.fields.creationTs',
    defaultMessage: 'Creation Timestamp',
  },
  editor_versionid: {
    id: 'emailCampaign.fields.editorVersionId',
    defaultMessage: 'Editor Version ID',
  },
  editor_version_value: {
    id: 'emailCampaign.fields.editorVersionValue',
    defaultMessage: 'Editor Version Value',
  },
  editor_groupid: {
    id: 'emailCampaign.fields.editorGroupId',
    defaultMessage: 'Editor Group ID',
  },
  editor_artifact_id: {
    id: 'emailCampaign.fields.editorArtifactId',
    defaultMessage: 'Editor Artifact ID',
  },
  currency_code: {
    id: 'emailCampaign.fields.currencyCode',
    defaultMessage: 'Currency Code',
  },
  technical_name: {
    id: 'emailCampaign.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  type: {
    id: 'emailCampaign.fields.type',
    defaultMessage: 'Type',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'emailCampaign.resourceHistory.title',
    defaultMessage: 'Email Campaign History',
  },
  history_resource_type: {
    id: 'emailCampaign.resourceHistory.type',
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
  status: { format: 'STRING' },
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
