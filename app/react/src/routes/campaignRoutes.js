import {
  CampaignsDisplayActionbar,
  CampaignsDisplayTable
} from '../containers/Campaigns/Display/List';

import {
  CampaignPage,
  AdGroupPage
} from '../containers/Campaigns/Display/Dashboard';

import {
  CreateEmailPage,
  EditEmailPage,
  CreateBlastPage,
  EditBlastPage
} from '../containers/Campaigns/Email/Edit';

import {
  CampaignsEmailActionbar,
  CampaignEmailListPage
} from '../containers/Campaigns/Email/List';

import {
  CampaignEmailActionbar,
  CampaignEmail
} from '../containers/Campaigns/Email/Dashboard';

import {
  GoalsActionbar,
  GoalsTable
} from '../containers/Campaigns/Goal/List';

const campaignsRoutes = [
  {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: CampaignsDisplayTable,
    actionBarComponent: CampaignsDisplayActionbar
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: CampaignPage
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroup/:adGroupId(\\d+)',
    layout: 'main',
    contentComponent: AdGroupPage
  },
  {
    path: '/campaigns/email',
    layout: 'main',
    contentComponent: CampaignEmailListPage,
    actionBarComponent: CampaignsEmailActionbar
  },
  {
    path: '/campaigns/email/create',
    layout: 'edit',
    editComponent: CreateEmailPage
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: CampaignEmail,
    actionBarComponent: CampaignEmailActionbar
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditEmailPage
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/create',
    layout: 'edit',
    editComponent: CreateBlastPage
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/:blastId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditBlastPage
  },
  {
    path: '/campaigns/goal',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar
  }
];

export default campaignsRoutes;
