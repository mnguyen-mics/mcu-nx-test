import { Export } from './../../../models/exports/exports';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { HistoryKeys, ValueFormat, formatToFormattingFunction } from '../../ResourceHistory/utils';

export default defineMessages({
  name: {
    id: 'exports.dashboard.table.name',
    defaultMessage: 'Name',
  },
  creationDate: {
    id: 'exports.dashboard.table.creationDate',
    defaultMessage: 'Creation Date',
  },
  startDate: {
    id: 'exports.dashboard.table.startDate',
    defaultMessage: 'Start Date',
  },
  download: {
    id: 'exports.dashboard.table.download',
    defaultMessage: 'Download',
  },
  archive: {
    id: 'exports.dashboard.actionbar.archive',
    defaultMessage: 'Archive',
  },
  exportExecutionsTitle: {
    id: 'exports.dashboard.table.title',
    defaultMessage: 'Export Executions',
  },
  newExecution: {
    id: 'exports.dashboard.actionbar.newExecution',
    defaultMessage: 'New Execution',
  },
  edit: {
    id: 'exports.dashboard.actionbar.edit',
    defaultMessage: 'Edit',
  },
  exportRunning: {
    id: 'exports.dashboard.actionbar.running',
    defaultMessage: 'An export execution is already running',
  },
  exportFailed: {
    id: 'exports.dashboard.actionbar.failed',
    defaultMessage: 'This export has failed. Please launch another execution.',
  },
  exportRunningDownload: {
    id: 'exports.dashboard.actionbar.running.download',
    defaultMessage: 'This export is being created, please try again when the export is succeeded.',
  },
  wait: {
    id: 'exports.dashboard.actionbar.wait',
    defaultMessage: 'Please wait until the export is done.',
  },
  notStarted: {
    id: 'exports.dashboard.actionbar.notStarted',
    defaultMessage: 'Not Started',
  },
  status: {
    id: 'exports.table.column.status',
    defaultMessage: 'Status',
  },
  history: {
    id: 'exports.dashboard.actionbar.history',
    defaultMessage: 'History',
  },
});

const exportPropertiesMessageMap: {
  [propertyName in keyof Export | HistoryKeys]: MessageDescriptor;
} = defineMessages({
  id: {
    id: 'export.fields.id',
    defaultMessage: 'ID',
  },
  datamart_id: {
    id: 'export.fields.datamartId',
    defaultMessage: 'Datamart ID',
  },
  name: {
    id: 'export.fields.name',
    defaultMessage: 'Export Name',
  },
  organisation_id: {
    id: 'export.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  output_format: {
    id: 'export.fields.outputFormat',
    defaultMessage: 'Output Format',
  },
  query_id: {
    id: 'export.fields.queryId',
    defaultMessage: 'Query ID',
  },
  type: {
    id: 'export.fields.type',
    defaultMessage: 'Typet',
  },
  history_title: {
    id: 'export.resourceHistory.title',
    defaultMessage: 'Export History',
  },
  history_resource_type: {
    id: 'export.resourceHistory.type',
    defaultMessage: 'Export',
  },
});

const exportPropertiesFormatMap: {
  [propertyName in keyof Export | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  datamart_id: { format: 'STRING' },
  name: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  output_format: { format: 'STRING' },
  query_id: { format: 'STRING' },
  type: { format: 'STRING' },
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
};

export const formatExportProperty = (
  property: keyof Export | HistoryKeys,
  value?: string,
): {
  message: MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: exportPropertiesMessageMap[property],
    formattedValue:
      value && exportPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            exportPropertiesFormatMap[property].format,
            exportPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};
