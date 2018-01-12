import {
  DisplayCampaignsActionbar,
  DisplayCampaignsTable,
} from '../containers/Campaigns/Display/List';

import {
  DisplayCampaignPage,
  AdGroupPage,
} from '../containers/Campaigns/Display/Dashboard';

import {
  EditAdGroupPage,
} from '../containers/Campaigns/Display/Edit';

import {
  EditCampaignPage,
} from '../containers/Campaigns/Display/Edit/Campaign/index.ts';

import {
  CreateEmailPage,
  EditEmailPage,
  CreateBlastPage,
  EditBlastPage,
} from '../containers/Campaigns/Email/Edit';

import {
  EmailCampaignsActionbar,
  EmailCampaignListPage,
} from '../containers/Campaigns/Email/List';

import {
  EmailCampaign,
} from '../containers/Campaigns/Email/Dashboard';

import {
  GoalsActionbar,
  GoalsTable,
} from '../containers/Campaigns/Goal/List';

import GoalDashboard from '../containers/Campaigns/Goal/Dashboard/GoalDashboard.tsx';

const campaignsRoutes = [
  {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: DisplayCampaignsTable,
    actionBarComponent: DisplayCampaignsActionbar,
  },
  {
    path: '/campaigns/display/create',
    layout: 'edit',
    editComponent: EditCampaignPage,
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditCampaignPage,
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: DisplayCampaignPage,
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/:adGroupId(\\d+)',
    layout: 'main',
    contentComponent: AdGroupPage,
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/create',
    layout: 'edit',
    editComponent: EditAdGroupPage,
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/edit/:adGroupId(\\d+)',
    layout: 'edit',
    editComponent: EditAdGroupPage,
  },
  {
    path: '/campaigns/email',
    layout: 'main',
    contentComponent: EmailCampaignListPage,
    actionBarComponent: EmailCampaignsActionbar,
  },
  {
    path: '/campaigns/email/create',
    layout: 'edit',
    editComponent: CreateEmailPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: EmailCampaign,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditEmailPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/create',
    layout: 'edit',
    editComponent: CreateBlastPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/:blastId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditBlastPage,
  },
  {
    path: '/campaigns/goal',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar,
  },
  {
    path: '/campaigns/goal/:goalId(\\d+)',
    layout: 'main',
    contentComponent: GoalDashboard,
  },
];

export default campaignsRoutes;
