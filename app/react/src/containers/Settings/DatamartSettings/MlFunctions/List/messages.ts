import { defineMessages } from 'react-intl';

export default defineMessages({
  mlFunction: {
    id: 'settings.mlFunction.breadcrumb.title',
    defaultMessage: 'Ml Function',
  },
  newMlFunction: {
    id: 'settings.mlFunction.actionbar.button.new',
    defaultMessage: 'New Ml Function',
  },
  empty: {
    id: 'settings.mlFunction.list.empty',
    defaultMessage: 'There is no Ml Function List created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.mlFunction.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.mlFunction.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
  mlFunctionArchiveTitle: {
    id: 'settings.mlFunction.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Ml Function?',
  },
  mlFunctionArchiveMessage: {
    id: 'settings.mlFunction.modal.archive.message',
    defaultMessage:
      'By archiving this Ml Function it will stop any computation associated. Are you sure?',
  },
  mlFunctionArchiveOk: {
    id: 'settings.mlFunction.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  mlFunctionArchiveCancel: {
    id: 'settings.mlFunction.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.mlFunction.list.column.name',
    defaultMessage: 'Name',
  },
});
