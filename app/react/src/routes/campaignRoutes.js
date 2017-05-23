import {
  CampaignsDisplayActionbar,
  CampaignsDisplayTable
} from '../containers/Campaigns/Display/List';

import {
  CampaignsEmailActionbar,
  CampaignsEmailTable
} from '../containers/Campaigns/Email/List';

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
    path: '/campaigns/goal',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar
  }
];

export default campaignsRoutes;
