import {
  CampaignsDisplayActionbar,
  CampaignsDisplayTable
} from '../containers/Campaigns/Display/List';

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

import { GoalsActionbar, GoalsTable } from '../containers/Campaigns/Goal/List';

const campaignsRoutes = [
  {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: CampaignsDisplayTable,
    actionBarComponent: CampaignsDisplayActionbar
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
    path: '/campaigns/email/:campaignId(\\d+)/blast/create',
    layout: 'edit',
    editComponent: CreateBlastPage
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blast/:blastId(\\d+)/edit',
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
