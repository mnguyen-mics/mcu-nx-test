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
  searchTitle: {
    id: 'exports.table.searchBar.label',
    defaultMessage: 'Search Exports',
  },
  name: {
    id: 'exports.list.column.name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'exports.list.column.type',
    defaultMessage: 'Type',
  },
  empty: {
    id: 'exports.list.empty',
    defaultMessage:
      'There is no Export List created yet! Click on New to get started',
  },
  archive: {
    id: 'exports.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
  filterByLabel: {
    id: 'exports.list.labelFilter.placeholder',
    defaultMessage: 'Filter By Label',
  }
});
