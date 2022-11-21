import { defineMessages, MessageDescriptor } from 'react-intl';

export const messages: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  searchPlaceholder: {
    id: 'campaign.email.search.placeholder',
    defaultMessage: 'Search Email Campaigns',
  },
  emailId: {
    id: 'campaign.email.id',
    defaultMessage: 'Id',
  },
  emailHeaderStatus: {
    id: 'campaign.email.status',
    defaultMessage: 'Status',
  },
  emailHeaderName: {
    id: 'campaign.email.name',
    defaultMessage: 'Name',
  },
  emailTechnicalName: {
    id: 'campaign.email.technicalName',
    defaultMessage: 'Technical Name',
  },
  emailHeaderSent: {
    id: 'campaign.email.email_sent',
    defaultMessage: 'Emails sent',
  },
  emailHeaderHardBounced: {
    id: 'campaign.email.email_hard_bounced',
    defaultMessage: 'Emails hard bounced',
  },
  emailHeaderSoftBounced: {
    id: 'campaign.email.email_soft_bounced',
    defaultMessage: 'Emails soft bounced',
  },
  emailHeaderClicks: {
    id: 'campaign.email.clicks',
    defaultMessage: 'Clicks',
  },
  emailHeaderImpressions: {
    id: 'campaign.email.impressions',
    defaultMessage: 'Imp',
  },
  PAUSED: {
    id: 'campaign.email.status.paused',
    defaultMessage: 'Paused',
  },
  ACTIVE: {
    id: 'campaign.email.status.active',
    defaultMessage: 'Active',
  },
  PENDING: {
    id: 'campaign.email.status.pending',
    defaultMessage: 'Pending',
  },
  ARCHIVED: {
    id: 'campaign.email.status.archived',
    defaultMessage: 'Archived',
  },
  editCampaign: {
    id: 'campaign.email.edit',
    defaultMessage: 'Edit',
  },
  archiveCampaign: {
    id: 'campaign.email.archive',
    defaultMessage: 'Archive',
  },
  emails: {
    id: 'campaign.email.list.actionbar.breadCrumbPath.emails',
    defaultMessage: 'Emails',
  },
  exportInProgress: {
    id: 'campaign.email.list.actionbar.exportInProgress',
    defaultMessage: 'Export in progress...',
  },
  emailCampaignsExportTitle: {
    id: 'campaign.email.list.export.title',
    defaultMessage: 'Email Campaigns Export',
  },
  confirmArchiveModalTitle: {
    id: 'campaign.email.archive.confirm_modal.title',
    defaultMessage: 'Are you sure you want to archive this Campaign ?',
  },
  confirmArchiveModalContent: {
    id: 'campaign.email.archive.confirm_modal.content',
    defaultMessage:
      "By archiving this Campaign all its activities will be suspended. You'll be able to recover it from the archived campaign filter.",
  },
  confirmArchiveModalOk: {
    id: 'campaign.email.archive.confirm_modal.ok',
    defaultMessage: 'Archive now',
  },
  confirmArchiveModalCancel: {
    id: 'campaign.email.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel',
  },
  fetchReportError: {
    id: 'campaign.email.error.fetch-report',
    defaultMessage: 'Cannot load campaign statistics',
  },
  fetchCampaignError: {
    id: 'campaign.email.error.fetch-campaign',
    defaultMessage: 'Cannot load campaign data',
  },
  filterByLabel: {
    id: 'campaign.email.filterBy.label',
    defaultMessage: 'Filter By Label',
  },
  noCampaign: {
    id: 'campaign.email.list.noCampaign',
    defaultMessage: 'No Email Campaigns',
  },
});

export default messages;
