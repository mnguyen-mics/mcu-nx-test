import { defineMessages } from 'react-intl';

export default defineMessages({
  id: {
    id: 'imports.dashboard.table.column.id',
    defaultMessage: 'ID',
  },
  name: {
    id: 'imports.dashboard.table.name',
    defaultMessage: 'Name',
  },
  creationDate: {
    id: 'imports.dashboard.table.creationDate',
    defaultMessage: 'Creation Date',
  },
  startDate: {
    id: 'imports.dashboard.table.startDate',
    defaultMessage: 'Start Date',
  },
  endDate: {
    id: 'imports.dashboard.table.endDate',
    defaultMessage: 'End Date',
  },
  progress: {
    id: 'imports.table.column.progress',
    defaultMessage: 'Progress',
  },
  delete: {
    id: 'imports.dashboard.actionbar.delete',
    defaultMessage: 'Delete',
  },
  importExecutionsTitle: {
    id: 'imports.dashboard.table.title',
    defaultMessage: 'Import Executions',
  },
  newExecution: {
    id: 'imports.dashboard.actionbar.newExecution',
    defaultMessage: 'New Execution',
  },
  edit: {
    id: 'imports.dashboard.actionbar.edit',
    defaultMessage: 'Edit',
  },
  importRunning: {
    id: 'imports.dashboard.actionbar.running',
    defaultMessage: 'An import execution is already running',
  },
  importFailed: {
    id: 'imports.dashboard.actionbar.failed',
    defaultMessage: 'This import has failed. Please launch another execution.',
  },
  importRunningDownload: {
    id: 'imports.dashboard.actionbar.running.download',
    defaultMessage: 'This import is being created, please try again when the import is succeeded.',
  },
  wait: {
    id: 'imports.dashboard.actionbar.wait',
    defaultMessage: 'Please wait until the import is done.',
  },
  notStarted: {
    id: 'imports.dashboard.actionbar.notStarted',
    defaultMessage: 'Not Started',
  },
  notEnded: {
    id: 'imports.dashboard.actionbar.notEnded',
    defaultMessage: 'Not ended',
  },
  notCreated: {
    id: 'imports.dashboard.actionbar.notCreated',
    defaultMessage: 'Not created',
  },
  status: {
    id: 'imports.table.column.status',
    defaultMessage: 'Status',
  },
  uploadError: {
    id: 'imports.dashboard.new.import.error',
    defaultMessage: 'Upload Error',
  },
  uploadTitle: {
    id: 'imports.dashboard.new.execution.modal.title',
    defaultMessage: 'New Import',
  },
  uploadErrorTooBig: {
    id: 'imports.dashboard.new.import.error.fileTooBig',
    defaultMessage: 'is too big (max size 100Mo).',
  },
  uploadMessage: {
    id: 'imports.dashboard.new.execution.modal.message',
    defaultMessage: 'Drag & Drop your file or click to import your file',
  },
  uploadMessage2: {
    id: 'imports.dashboard.new.execution.modal.message2',
    defaultMessage: '(.ndjson or .csv and max size 100Mo)',
  },
  uploadConfirm: {
    id: 'imports.dashboard.new.execution.modal.confirm',
    defaultMessage: 'Ok',
  },
  uploadCancel: {
    id: 'imports.dashboard.new.execution.modal.cancel',
    defaultMessage: 'Cancel',
  },
  downloadErrorFile: {
    id: 'imports.execution.result.error.download',
    defaultMessage: 'Download error file',
  },
  downloadInputFile: {
    id: 'imports.execution.result.input.download',
    defaultMessage: 'Download input file',
  },
});
