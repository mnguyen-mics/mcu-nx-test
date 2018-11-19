import { defineMessages } from 'react-intl';

export default defineMessages({
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
  archive: {
    id: 'imports.dashboard.actionbar.archive',
    defaultMessage: 'Archive',
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
    defaultMessage:
      'This import is being created, please try again when the import is succeeded.',
  },
  wait: {
    id: 'imports.dashboard.actionbar.wait',
    defaultMessage: 'Please wait until the import is done.',
  },
  notStarted: {
    id: 'imports.dashboard.actionbar.notStarted',
    defaultMessage: 'Not Started',
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
  uploadMessage: {
    id: 'imports.dashboard.new.execution.modal.message',
    defaultMessage: 'Drag & Drop your file or click to import your file.',
  },
  uploadConfirm: {
    id: 'imports.dashboard.new.execution.modal.confirm',
    defaultMessage: 'Ok',
  },
  uploadCancel: {
    id: 'imports.dashboard.new.execution.modal.cancel',
    defaultMessage: 'Cancel',
  },
});
