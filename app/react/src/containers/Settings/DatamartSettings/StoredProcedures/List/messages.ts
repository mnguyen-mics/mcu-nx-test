import { defineMessages } from "react-intl";

export default defineMessages({
  storedProcedure: {
    id: 'settings.storedProcedure.breadcrumb.title',
    defaultMessage: 'Stored Procedure',
  },
  newStoredProcedure: {
    id: 'settings.storedProcedure.actionbar.button.new',
    defaultMessage: 'New Stored Procedure',
  },
  empty: {
    id: 'settings.storedProcedure.list.empty',
    defaultMessage:
      'There is no Stored Procedure List created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.storedProcedure.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.storedProcedure.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
  storedProcedureArchiveTitle: {
    id: 'settings.storedProcedure.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Stored Procedure?',
  },
  storedProcedureArchiveMessage: {
    id: 'settings.storedProcedure.modal.archive.message',
    defaultMessage:
      'By archiving this Stored Procedure it will stop any computation associated. Are you sure?',
  },
  storedProcedureArchiveOk: {
    id: 'settings.storedProcedure.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  storedProcedureArchiveCancel: {
    id: 'settings.storedProcedure.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.storedProcedure.list.column.name',
    defaultMessage: 'Name',
  },
})