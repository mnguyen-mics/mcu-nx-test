import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'campaign.email.search.placeholder',
    defaultMessage: 'Search Email Campaigns',
  },
  emailHeaderStatus: {
    id: 'campaign.email.status',
    defaultMessage: 'Status',
  },
  emailHeaderName: {
    id: 'campaign.email.name',
    defaultMessage: 'Name',
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
});

export default messages;
