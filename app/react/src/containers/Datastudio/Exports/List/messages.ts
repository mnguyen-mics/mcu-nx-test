import { defineMessages } from 'react-intl';

export default defineMessages({
  exports: {
    id: 'exports.breadcrumb.title',
    defaultMessage: 'Exports',
  },
  newExport: {
    id: 'exports.actionbar.button.new',
    defaultMessage: 'New Export',
  },
  exportsArchiveTitle: {
    id: 'exports.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Export?',
  },
  exportsArchiveMessage: {
    id: 'exports.modal.archive.message',
    defaultMessage:
      'By archiving this Export it will stop campaigns using it. Are you sure?',
  },
  exportsArchiveOk: {
    id: 'exports.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  exportsArchiveCancel: {
    id: 'exports.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'exports.table.column.name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'exports.table.column.type',
    defaultMessage: 'Type',
  },
  empty: {
    id: 'exports.table.empty',
    defaultMessage:
      'There is no Export List created yet! Click on New to get started',
  },
});
