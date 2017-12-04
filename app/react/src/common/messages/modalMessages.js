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
    id: 'modal.archive.campaign.confirm',
    defaultMessage: 'Are you sure you want to archive this Campaign?'
  },
  archiveCampaignMessage: {
    id: 'modal.archive.campaign.message',
    defaultMessage: 'By archiving this Campaign all its activities will be suspended. You\'ll be able to recover it from the archived campaign filter.'
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
});
