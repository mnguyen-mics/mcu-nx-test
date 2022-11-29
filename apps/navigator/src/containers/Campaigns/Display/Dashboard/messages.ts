import { defineMessages, MessageDescriptor } from 'react-intl';

const messages: {
  [key: string]: MessageDescriptor;
} = defineMessages({
  dashboardOverview: {
    id: 'display.dashboard.overview',
    defaultMessage: 'Overview',
  },
  dashboardTopSites: {
    id: 'display.dashboard.topSites',
    defaultMessage: 'Top Sites',
  },
  dashboardLive: {
    id: 'display.dashboard.Live',
    defaultMessage: 'Delivery Analysis',
  },
  adGroups: {
    id: 'display.card.adGroup',
    defaultMessage: 'Ad Groups',
  },
  newAdGroups: {
    id: 'display.card.newAdGroup',
    defaultMessage: 'New Ad Group',
  },
  editAdGroups: {
    id: 'display.card.editAdGroup',
    defaultMessage: 'Edit Ad Groups',
  },
  activateAdGroups: {
    id: 'display.card.activateAdGroups',
    defaultMessage: 'Activate',
  },
  pauseAdGroups: {
    id: 'display.card.pauseAdGroups',
    defaultMessage: 'Pause',
  },
  creatives: {
    id: 'display.card.creatives',
    defaultMessage: 'Creatives',
  },
  newCreatives: {
    id: 'display.card.newCreatives',
    defaultMessage: 'New Creative',
  },
  pauseAdGroup: {
    id: 'display.adGroup.actionBar.pauseAdGroup',
    defaultMessage: 'Pause Ad Group',
  },
  activateAdGroup: {
    id: 'display.adGroup.actionBar.activateAdGroup',
    defaultMessage: 'Activate Ad Group',
  },
  pauseCampaign: {
    id: 'display.campaign.actionBar.pauseCampaign',
    defaultMessage: 'Pause Campaign',
  },
  activateCampaign: {
    id: 'display.campaign.actionBar.activateCampaign',
    defaultMessage: 'Activate Campaign',
  },
  campaignActive: {
    id: 'display.campaign.header.campaignActive',
    defaultMessage: 'Campaign Active',
  },
  adGroupActive: {
    id: 'display.campaign.header.adGroupActive',
    defaultMessage: 'Ad Group Active',
  },
  campaignPause: {
    id: 'display.campaign.header.campaignPaused',
    defaultMessage: 'Campaign Paused',
  },
  adGroupPause: {
    id: 'display.campaign.header.adGroupPaused',
    defaultMessage: 'Ad Group Paused',
  },
  campaignPending: {
    id: 'display.campaign.header.campaignPending',
    defaultMessage: 'Campaign Pending',
  },
  adGroupPending: {
    id: 'display.campaign.header.adGroupPending',
    defaultMessage: 'Ad Group Pending',
  },
  editCampaign: {
    id: 'display.campaign.actionBar.editCampaign',
    defaultMessage: 'Edit',
  },
  editAdGroup: {
    id: 'display.adGroup.actionBar.editAdGroup',
    defaultMessage: 'Edit',
  },
  archiveCampaign: {
    id: 'display.campaign.actionBar.archiveCampaign',
    defaultMessage: 'Archive',
  },
  archiveAdGroup: {
    id: 'display.adGroup.actionBar.archiveAdGroup',
    defaultMessage: 'Archive',
  },
  archiveAdGroupModalTitle: {
    id: 'display.adGroup.archiveAdGroupTitle',
    defaultMessage: 'Are you sure you want to archive this Ad Group ?',
  },
  archiveAdGroupModalMessage: {
    id: 'display.adGroup.archiveAdGroupMessage',
    defaultMessage:
      "By archiving this Ad Group all its activities will be suspended. You'll be able to recover it from the archived ad Group filter.",
  },
  archiveAdGroupsModalTitle: {
    id: 'display.adGroup.archiveAdGroupsTitle',
    defaultMessage: 'Archive Ad Groups',
  },
  archiveAdGroupsModalMessage: {
    id: 'display.adGroup.archiveAdGroupsMessage',
    defaultMessage: 'Are you sure to archive all the selected Ad Groups ?',
  },
  archiveAdsModalTitle: {
    id: 'display.adGroup.archiveAdsTitle',
    defaultMessage: 'Archive Creatives',
  },
  archiveAdsModalMessage: {
    id: 'display.adGroup.archiveAdsMessage',
    defaultMessage: 'Are you sure to archive all the selected Creatives ?',
  },
  display: {
    id: 'display.campaign.actionBar.display',
    defaultMessage: 'Display',
  },
  notificationAdGroupActivationSuccess: {
    id: 'display.notifications.adgroup.activation.success',
    defaultMessage: 'Ad Group {name} Successfully Activated',
  },
  notificationAdGroupActivationError: {
    id: 'display.notifications.adgroup.activation.error',
    defaultMessage: 'There was an error activating your Ad Group {name}... Please try again...',
  },
  notificationAdGroupPauseSuccess: {
    id: 'display.notifications.adgroup.pause.success',
    defaultMessage: 'Ad Group {name} Successfully Paused',
  },
  notificationAdGroupPauseError: {
    id: 'display.notifications.adgroup.pause.error',
    defaultMessage: 'There was an error pausing your Ad Group {name}... Please try again...',
  },
  notificationAdActivationSuccess: {
    id: 'display.notifications.ad.activation.success',
    defaultMessage: 'Ad {name} Successfully Activated',
  },
  notificationAdActivationError: {
    id: 'display.notifications.ad.activation.error',
    defaultMessage: 'There was an error activating your Ad {name}... Please try again...',
  },
  notificationAdPauseSuccess: {
    id: 'display.notifications.ad.pause.success',
    defaultMessage: 'Ad {name} Successfully Paused',
  },
  notificationAdPauseError: {
    id: 'display.notifications.ad.pause.error',
    defaultMessage: 'There was an error pausing your Ad {name}... Please try again...',
  },
  adAuditSuccess: {
    id: 'display.ad.audit.success',
    defaultMessage: 'Audit Successful',
  },
  adAuditError: {
    id: 'display.ad.audit.error',
    defaultMessage: 'You need to pass the Audit first',
  },
  notificationSuccess: {
    id: 'notification.success.title',
    defaultMessage: 'Success',
  },
  notificationError: {
    id: 'notification.success.error',
    defaultMessage: 'Error',
  },
  notificationErrorGeneric: {
    id: 'notification.success.error.generic',
    defaultMessage:
      'There was an error, please contact the administrator with the following error id: {errorId}',
  },
  undo: {
    id: 'notification.button.undo',
    defaultMessage: 'Undo',
  },
  totalBudgetConsumption: {
    id: 'progress.budget.total',
    defaultMessage: 'Total Budget Consumption',
  },
  dailyBudgetConsumption: {
    id: 'progress.budget.daily',
    defaultMessage: 'Daily Budget Consumption',
  },
  weeklyBudgetConsumption: {
    id: 'progress.budget.weekly',
    defaultMessage: 'Weekly Budget Consumption',
  },
  monthlyBudgetConsumption: {
    id: 'progress.budget.monthly',
    defaultMessage: 'Monthly Budget Consumption',
  },
  weightedConversion: {
    id: 'campaign.goal.chart.weightedConversion',
    defaultMessage: 'Weighted Conversion',
  },
  impressions: {
    id: 'campaign.chart.impressions',
    defaultMessage: 'Imp.',
  },
  displayNetworkName: {
    id: 'campaign.chart.displayNetworkName',
    defaultMessage: 'Display Network',
  },
  displayNetworkNameUncategorized: {
    id: 'display.metrics.displayNetworkNameUncategorized',
    defaultMessage: 'Uncategorized',
  },
  format: {
    id: 'campaign.chart.format',
    defaultMessage: 'Format',
  },
  status: {
    id: 'campaign.chart.status',
    defaultMessage: 'Status',
  },
  name: {
    id: 'campaign.chart.name',
    defaultMessage: 'Name',
  },
  ctr: {
    id: 'campaign.chart.ctr',
    defaultMessage: 'CTR',
  },
  clicks: {
    id: 'campaign.chart.clicks',
    defaultMessage: 'Clicks',
  },
  impressions_cost: {
    id: 'campaign.chart.impressions_cost',
    defaultMessage: 'Spent.',
  },
  cpm: {
    id: 'campaign.chart.cpm',
    defaultMessage: 'CPM.',
  },
  cpc: {
    id: 'campaign.chart.cpc',
    defaultMessage: 'CPC.',
  },
  cpa: {
    id: 'campaign.chart.cpa',
    defaultMessage: 'CPA.',
  },
  noGoalStatAvailable: {
    id: 'campaign.goal.chart.noStats',
    defaultMessage:
      'There is no conversion associated to this attribution model and campaign on the given period.',
  },
  noStatAvailable: {
    id: 'campaign.stat.chart.noStats',
    defaultMessage: 'There is no stats available for this period of time.',
  },
  duplicate: {
    id: 'campaign.display.dashboard.duplicate',
    defaultMessage: 'Duplicate',
  },
  creativeModalConfirmArchivedTitle: {
    id: 'creative.modal.confirm.archived.title',
    defaultMessage: 'Are you sure to archive this creative ?',
  },
  creativeModalConfirmArchivedContent: {
    id: 'creative.modal.confirm.archived.content',
    defaultMessage: "You will still be able to get back your creative in the 'Archive' category.",
  },
  creativeModalConfirmArchivedOk: {
    id: 'creative.modal.confirm.ok',
    defaultMessage: 'Archive Now',
  },
  cancelText: {
    id: 'creative.modal.confirm.cancel',
    defaultMessage: 'Cancel',
  },
  editionNotAllowed: {
    id: 'display.campaign.actionbar.edition.not.allowed',
    defaultMessage:
      'Edition on this campaign is deprecated, you must use navigator legacy to edit this campaign.',
  },
  adServingDownload: {
    id: 'display.campaign.actionbar.adserving.download',
    defaultMessage: 'Get Your Snippets',
  },
  googleDfp: {
    id: 'display.campaign.actionbar.adserving.google_dfp',
    defaultMessage: 'Google DoubleClick For Publisher (DFP)',
  },
  googleDbm: {
    id: 'display.campaign.actionbar.adserving.google_dbm',
    defaultMessage: 'Google DoubleClick Bid Manager (DBM)',
  },
  apx: {
    id: 'display.campaign.actionbar.adserving.apx',
    defaultMessage: 'App Nexus',
  },
  none: {
    id: 'display.campaign.actionbar.adserving.none',
    defaultMessage: 'Other',
  },
  emptyAds: {
    id: 'display.campaign.actionbar.adserving.emptyAds',
    defaultMessage: 'There is no ads attached to your campaign.',
  },
  history: {
    id: 'display.campaign.actionbar.history',
    defaultMessage: 'History',
  },
  smartAdServer: {
    id: 'display.campaign.actionbar.adserving.smart_ad_server',
    defaultMessage: 'Smart Ad Server',
  },
  exportInProgress: {
    id: 'display.campaign.dashboard.exportInProgress',
    defaultMessage: 'Export in progress',
  },
});

export default messages;
