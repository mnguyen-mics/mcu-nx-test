import {
  CampaignsDisplayActionbar,
  CampaignsDisplayTable
} from '../containers/Campaigns/Display/List';

import {
  CampaignsEmailActionbar,
  CampaignsEmailTable
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
    path: '/campaigns/email',
    layout: 'main',
    contentComponent: CampaignsEmailTable,
    actionBarComponent: CampaignsEmailActionbar
  },
  {
    path: '/campaigns/email/:campaignId',
    layout: 'main',
    contentComponent: CampaignEmail,
    actionBarComponent: CampaignEmailActionbar
  },
  {
    path: '/campaigns/goal',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar
  }
];

export default campaignsRoutes;
