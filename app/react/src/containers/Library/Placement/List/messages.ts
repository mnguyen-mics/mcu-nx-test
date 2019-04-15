import { defineMessages } from 'react-intl';

export default defineMessages({
  placements: {
    id: 'placements.breadcrumb.title',
    defaultMessage: 'Placements',
  },
  newPlacement: {
    id: 'placements.actionbar.button.new',
    defaultMessage: 'New Placement',
  },
  placementArchiveTitle: {
    id: 'placements.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Placement?',
  },
  placementArchiveMessage: {
    id: 'placements.modal.archive.message',
    defaultMessage:
      'By archiving this Placement it will stop campaigns using it. Are you sure?',
  },
  placementArchiveOk: {
    id: 'placements.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  placementArchiveCancel: {
    id: 'placements.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'placements.table.column.name',
    defaultMessage: 'Name',
  },
  empty: {
    id: 'placements.lsit.empty',
    defaultMessage:
      'There is no Placement List created yet! Click on New to get started',
  },
  edit: {
    id: 'placements.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'placements.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});
