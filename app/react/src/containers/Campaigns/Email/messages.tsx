import * as React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  HistoryKeys,
  formatToFormattingFunction,
  ValueFormat,
} from '../../../containers/ResourceHistory/utils';
import { CampaignStatus } from '../../../models/campaign/constants';
import {
  EmailBlastResource,
  EmailBlastStatus,
  EmailCampaignResource,
} from '../../../models/campaign/email';

export default defineMessages({
  id: {
    id: 'email.campaign.actionBar.id',
    defaultMessage: 'Id',
  },
  email: {
    id: 'email.campaign.actionBar.email',
    defaultMessage: 'Email',
  },
  history: {
    id: 'email.campaign.actionBar.history',
    defaultMessage: 'History',
  },
  // Email Campaign
  emailSent: {
    id: 'email.metrics.email_sent',
    defaultMessage: 'Sent',
  },
  emailHardBounced: {
    id: 'email.metrics.email_hard_bounced',
    defaultMessage: 'Hard Bounced',
  },
  emailSoftBounced: {
    id: 'email.metrics.email_soft_bounced',
    defaultMessage: 'Soft Bounced',
  },
  clicks: {
    id: 'email.metrics.clicks',
    defaultMessage: 'Clicks',
  },
  impressions: {
    id: 'email.metrics.impressions',
    defaultMessage: 'Impressions',
  },
  emailUnsubscribed: {
    id: 'email.metrics.email_unsubscribed',
    defaultMessage: 'Unsubscribed',
  },
  emailComplaints: {
    id: 'email.metrics.email_complaints',
    defaultMessage: 'Complaints',
  },
  uniqImpressions: {
    id: 'email.metrics.unique_impressions',
    defaultMessage: 'Unique Impressions',
  },
  uniqClicks: {
    id: 'email.metrics.unique_clicks',
    defaultMessage: 'Unique Clicks',
  },
  uniqEmailSent: {
    id: 'email.metrics.unique_email_sent',
    defaultMessage: 'Unique Sent',
  },
  uniqEmailUnsubscribed: {
    id: 'email.metrics.unique_email_unsubscribed',
    defaultMessage: 'Unique Unsubscribed',
  },
  uniqEmailHardBounced: {
    id: 'email.metrics.unique_email_hard_bounced',
    defaultMessage: 'Unique Hard Bounced',
  },
  uniqEmailSoftBounced: {
    id: 'email.metrics.unique_email_soft_bounced',
    defaultMessage: 'Unique Soft Bounced',
  },
  uniqEmailComplaints: {
    id: 'email.metrics.unique_email_complaints',
    defaultMessage: 'Unique Complaints',
  },
  // Email Blast
  batchSize: {
    id: 'email.blast.metrics.id',
    defaultMessage: 'Id',
  },
  blastName: {
    id: 'email.blast.metrics.batch_size',
    defaultMessage: 'Blast Name',
  },
  fromEmail: {
    id: 'email.blast.metrics.blast_name',
    defaultMessage: 'From Email',
  },
  fromName: {
    id: 'email.blast.metrics.from_email',
    defaultMessage: 'From Name',
  },
  numberEmailNotSent: {
    id: 'email.blast.metrics.number_email_not_sent',
    defaultMessage: 'Number Of Email Not Sent',
  },
  replyTo: {
    id: 'email.blast.metrics.reply_to',
    defaultMessage: 'Reply To',
  },
  sendDate: {
    id: 'email.blast.metrics.send_date',
    defaultMessage: 'Send Date',
  },
  status: {
    id: 'email.blast.metrics.status',
    defaultMessage: 'Status',
  },
  subjectLine: {
    id: 'email.blast.metrics.subject_line',
    defaultMessage: 'Subject Line',
  },
});

const emailBlastStatusMessages: {
  [key in EmailBlastStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  SCENARIO_ACTIVATED: {
    id: 'emailBlast.fields.status.scenarioActivated',
    defaultMessage: 'Scenario Activation',
  },
  PENDING: {
    id: 'emailBlast.fields.status.pending',
    defaultMessage: 'Pending',
  },
  SCHEDULED: {
    id: 'emailBlast.fields.status.scheduled',
    defaultMessage: 'Scheduled',
  },
  FINISHED: {
    id: 'emailBlast.fields.status.finished',
    defaultMessage: 'Finished',
  },
  ERROR: {
    id: 'emailBlast.fields.status.error',
    defaultMessage: 'Error',
  },
});

const emailBlastPropertiesMessageMap: {
  [propertyName in
    | keyof EmailBlastResource
    | HistoryKeys]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  id: {
    id: 'emailBlast.fields.id',
    defaultMessage: 'ID',
  },
  blast_name: {
    id: 'emailBlast.fields.blastName',
    defaultMessage: 'Blast name',
  },
  send_date: {
    id: 'emailBlast.fields.sendDate',
    defaultMessage: 'Send date',
  },
  subject_line: {
    id: 'emailBlast.fields.subjectLine',
    defaultMessage: 'Subject',
  },
  from_email: {
    id: 'emailBlast.fields.fromEmail',
    defaultMessage: 'From email',
  },
  from_name: {
    id: 'emailBlast.fields.fromName',
    defaultMessage: 'From name',
  },
  reply_to: {
    id: 'emailBlast.fields.replyTo',
    defaultMessage: 'Reply to',
  },
  status: {
    id: 'emailBlast.fields.status',
    defaultMessage: 'Status',
  },
  number_mail_not_send: {
    id: 'emailBlast.fields.numberMailNotSend',
    defaultMessage: 'Number Of Mail Not Send',
  },
  batch_size: {
    id: 'emailBlast.fields.batchSize',
    defaultMessage: 'Batch Size',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'emailBlast.resourceHistory.title',
    defaultMessage: 'Email Blast History',
  },
  history_resource_type: {
    id: 'emailBlast.resourceHistory.type',
    defaultMessage: 'Email Blast',
  },
});

const emailBlastPropertiesFormatMap: {
  [propertyName in keyof EmailBlastResource | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: FormattedMessage.MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  blast_name: { format: 'STRING' },
  send_date: { format: 'TIMESTAMP' },
  subject_line: { format: 'STRING' },
  from_email: { format: 'STRING' },
  from_name: { format: 'STRING' },
  reply_to: { format: 'STRING' },
  status: {
    format: 'MESSAGE',
    messageMap: emailBlastStatusMessages,
  },
  number_mail_not_send: { format: 'INTEGER' },
  batch_size: { format: 'INTEGER' },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
};

export const formatEmailBlastProperty = (
  property: keyof EmailBlastResource | HistoryKeys,
  value?: string,
): {
  message: FormattedMessage.MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: emailBlastPropertiesMessageMap[property],
    formattedValue:
      value && emailBlastPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            emailBlastPropertiesFormatMap[property].format,
            emailBlastPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};

const emailCampaignStatusMessages: {
  [key in CampaignStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  ACTIVE: {
    id: 'campaign.email.fields.status.active',
    defaultMessage: 'Active',
  },
  PENDING: {
    id: 'campaign.email.fields.status.pending',
    defaultMessage: 'Pending',
  },
  PAUSED: {
    id: 'campaign.email.fields.status.paused',
    defaultMessage: 'Paused',
  },
  ARCHIVED: {
    id: 'campaign.email.fields.status.archived',
    defaultMessage: 'Archived',
  },
});

const emailCampaignPropertiesMessageMap: {
  [propertyName in
    | keyof EmailCampaignResource
    | HistoryKeys]: FormattedMessage.MessageDescriptor;
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
  editor_version_id: {
    id: 'campaign.email.fields.editorVersionId',
    defaultMessage: 'Editor Version ID',
  },
  editor_version_value: {
    id: 'campaign.email.fields.editorVersionValue',
    defaultMessage: 'Editor Version Value',
  },
  editor_group_id: {
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
    format: ValueFormat;
    messageMap?: { [key: string]: FormattedMessage.MessageDescriptor };
  };
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
  editor_version_id: { format: 'STRING' },
  editor_version_value: { format: 'STRING' },
  editor_group_id: { format: 'STRING' },
  editor_artifact_id: { format: 'STRING' },
  currency_code: { format: 'STRING' },
  technical_name: { format: 'STRING' },
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

export const formatCampaignProperty = (
  property: keyof EmailCampaignResource | HistoryKeys,
  value?: string,
): {
  message: FormattedMessage.MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: emailCampaignPropertiesMessageMap[property],
    formattedValue:
      value && emailCampaignPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            emailCampaignPropertiesFormatMap[property].format,
            emailCampaignPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};
