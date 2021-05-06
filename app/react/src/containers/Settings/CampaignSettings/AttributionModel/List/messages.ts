import { defineMessages } from 'react-intl';

export default defineMessages({
  attributionmodel: {
    id: 'settings.attributionmodel.breadcrumb.title',
    defaultMessage: 'Attribution Models',
  },
  newAttributionModel: {
    id: 'settings.attributionmodel.actionbar.button.new',
    defaultMessage: 'New Attribution Model',
  },
  attributionModelArchiveTitle: {
    id: 'settings.attributionmodel.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Attribution Model?',
  },
  attributionModelArchiveMessage: {
    id: 'settings.attributionmodel.modal.archive.message',
    defaultMessage:
      'By archiving this Attribution Model it will stop campaigns using it. Are you sure?',
  },
  attributionModelArchiveOk: {
    id: 'settings.attributionmodel.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  attributionModelArchiveCancel: {
    id: 'settings.attributionmodel.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.attributionmodel.list.column.name',
    defaultMessage: 'Name',
  },
  engine: {
    id: 'settings.attributionmodel.list.column.engine',
    defaultMessage: 'Attribution Model Engine',
  },
  miner: {
    id: 'settings.attributionmodel.list.column.miner',
    defaultMessage: 'Data Miner',
  },
  empty: {
    id: 'settings.attributionmodel.list.empty',
    defaultMessage: 'There is no Attribution Models created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.attributionmodel.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.attributionmodel.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});
