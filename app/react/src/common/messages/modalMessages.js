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
  }
});
