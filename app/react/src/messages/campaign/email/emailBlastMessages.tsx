import { defineMessages, FormattedMessage } from "react-intl";
import { EmailBlastResource, EmailBlastStatus } from "../../../models/campaign/email";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';

const emailBlastStatusMessages: {
  [key in EmailBlastStatus]: FormattedMessage.MessageDescriptor
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
  [propertyName in keyof EmailBlastResource | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'emailBlast.fields.id',
    defaultMessage: 'ID'
  },
  blast_name: {
    id: 'emailBlast.fields.blastName',
    defaultMessage: 'Blast name'
  },
  send_date: {
    id: 'emailBlast.fields.sendDate',
    defaultMessage: 'Send date'
  },
  subject_line: {
    id: 'emailBlast.fields.subjectLine',
    defaultMessage: 'Subject'
  },
  from_email: {
    id: 'emailBlast.fields.fromEmail',
    defaultMessage: 'From email'
  },
  from_name: {
    id: 'emailBlast.fields.fromName',
    defaultMessage: 'From name'
  },
  reply_to: {
    id: 'emailBlast.fields.replyTo',
    defaultMessage: 'Reply to'
  },
  status: {
    id: 'emailBlast.fields.status',
    defaultMessage: 'Status'
  },
  number_mail_not_send: {
    id: 'emailBlast.fields.numberMailNotSend',
    defaultMessage: 'Number Of Mail Not Send'
  },
  batch_size: {
    id: 'emailBlast.fields.batchSize',
    defaultMessage: 'Batch Size'
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
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
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
}

function formatEmailBlastProperty(property: keyof EmailBlastResource | HistoryKeys, value?: string): {
  message: FormattedMessage.MessageDescriptor,
  formattedValue?: React.ReactNode,
} {
  return {
    message: emailBlastPropertiesMessageMap[property],
    formattedValue: (value && emailBlastPropertiesFormatMap[property])
      ? formatToFormattingFunction(value, emailBlastPropertiesFormatMap[property].format, emailBlastPropertiesFormatMap[property].messageMap)
      : undefined,
  }
}

export default formatEmailBlastProperty;
