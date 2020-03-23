import { defineMessages } from 'react-intl';

export default defineMessages({
  // Generic
  confirm: {
    id: 'modal.confirm',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'modal.cancel',
    defaultMessage: 'Cancel'
  },
  // Specific
  archiveCampaignConfirm: {
    id: 'campaign.archive.modal.confirm',
    defaultMessage: 'Are you sure you want to archive this Campaign?'
  },
  archiveCampaignMessage: {
    id: 'campaign.archive.modal.message',
    defaultMessage: 'By archiving this Campaign all its activities will be suspended. You\'ll be able to recover it from the archived campaign filter.'
  },
  archiveImportConfirm: {
    id: 'import.archive.modal.confirm',
    defaultMessage: 'Are you sure you want to archive this Import?'
  },
  archiveImportMessage: {
    id: 'import.archive.modal.message',
    defaultMessage: 'By archiving this Import all its executions and associated files will be unavailable.'
  },
  archiveExportConfirm: {
    id: 'export.list.archive.modal.title',
    defaultMessage: 'Are you sure you want to archive this Export?'
  },
  archiveExportMessage: {
    id: 'export.list.archive.modal.message',
    defaultMessage: 'By archiving this Export all its executions and associated files will be unavailable.'
  },
  noActionTitle: {
    id: 'modal.noupolad.title',
    defaultMessage: 'Unable to perform this action.'
  },
  noUploadMessage: {
    id: 'modal.noupolad.message',
    defaultMessage: 'Your creative has been successfully audited. If you want to modify it, please reset the audit, modify it and submit to audit again.'
  },
  noUpdateMessage: {
    id: 'modal.update.message',
    defaultMessage: 'Your creative audit is pending. If you want to modify it, please wait until the audit is done, reset it, modify your creative and submit to audit again.'
  },
  exportIsRunningTitle: {
    id: 'export.running.modal.title',
    defaultMessage: 'Export is running'
  },
  exportIsRunningMessage: {
    id: 'export.running.modal.message',
    defaultMessage: 'Please wait until the export is fully completed.'
  },
});
