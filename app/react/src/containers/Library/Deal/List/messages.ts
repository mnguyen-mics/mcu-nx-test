import { defineMessages } from 'react-intl';

export default defineMessages({
  dealList: {
    id: 'deals.breadcrumb.title',
    defaultMessage: 'Deal Lists',
  },
  newDealList: {
    id: 'deals.actionbar.button.new',
    defaultMessage: 'New Deal List',
  },
  dealListArchiveTitle: {
    id: 'deals.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Deal List?',
  },
  dealListArchiveMessage: {
    id: 'deals.modal.archive.message',
    defaultMessage: 'By archiving this Deal List it will stop campaigns using it. Are you sure?',
  },
  dealListArchiveOk: {
    id: 'deals.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  dealListArchiveCancel: {
    id: 'deals.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'deals.list.column.name',
    defaultMessage: 'Name',
  },
  empty: {
    id: 'deals.list.empty',
    defaultMessage: 'There is no Deal List List created yet! Click on New to get started',
  },
  edit: {
    id: 'deals.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'deals.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
})