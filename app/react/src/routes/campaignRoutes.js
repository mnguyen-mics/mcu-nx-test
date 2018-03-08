import {
  DisplayCampaignsPage,
} from '../containers/Campaigns/Display/List';

import {
  DisplayCampaignPage,
  AdGroupPage,
} from '../containers/Campaigns/Display/Dashboard';

import {
  EditAdGroupPage,
} from '../containers/Campaigns/Display/Edit/AdGroup/index.ts';

import {
  EditCampaignPage,
} from '../containers/Campaigns/Display/Edit/index.ts';

// import {
//   CreateEmailPage,
//   EditEmailPage,
//   CreateBlastPage,
// } from '../containers/Campaigns/Email/Edit';

import EditGoalPage from '../containers/Campaigns/Goal/Edit/EditGoalPage.tsx';

import EditBlastPage from '../containers/Campaigns/Email/Edit/Blast/EditBlastPage.tsx';
import EditEmailCampaignPage from '../containers/Campaigns/Email/Edit/Campaign/EditCampaignPage.tsx';

import {
  EmailCampaignsActionbar,
  EmailCampaignListPage,
} from '../containers/Campaigns/Email/List';

import { EmailCampaign } from '../containers/Campaigns/Email/Dashboard';

import { GoalsActionbar, GoalsTable } from '../containers/Campaigns/Goal/List';

import GoalDashboard from '../containers/Campaigns/Goal/Dashboard/GoalDashboard.tsx';

const campaignsRoutes = [
  {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: DisplayCampaignsPage,
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
    editComponent: EditEmailCampaignPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: EmailCampaign,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditEmailCampaignPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/create',
    layout: 'edit',
    editComponent: EditBlastPage,
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/:blastId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditBlastPage,
  },
  {
    path: '/campaigns/goals',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar,
  },
  {
    path: '/campaigns/goal/:goalId(\\d+)',
    layout: 'main',
    contentComponent: GoalDashboard,
  },
  {
    path: '/campaigns/goal/:goalId/edit',
    layout: 'edit',
    editComponent: EditGoalPage,
  },
  {
    path: '/campaigns/goal',
    layout: 'edit',
    editComponent: EditGoalPage,
  },
];

export default campaignsRoutes;
