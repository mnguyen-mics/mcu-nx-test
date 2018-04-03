import { DisplayCampaignsPage } from '../containers/Campaigns/Display/List';

import {
  DisplayCampaignPage,
  AdGroupPage,
} from '../containers/Campaigns/Display/Dashboard';

import { EditAdGroupPage } from '../containers/Campaigns/Display/Edit/AdGroup';

import { EditCampaignPage } from '../containers/Campaigns/Display/Edit';

// import {
//   CreateEmailPage,
//   EditEmailPage,
//   CreateBlastPage,
// } from '../containers/Campaigns/Email/Edit';

import EditGoalPage from '../containers/Campaigns/Goal/Edit/EditGoalPage';
import EditBlastPage from '../containers/Campaigns/Email/Edit/Blast/EditBlastPage';
import EditEmailCampaignPage from '../containers/Campaigns/Email/Edit/Campaign/EditCampaignPage';

import {
  EmailCampaignsActionbar,
  EmailCampaignListPage,
} from '../containers/Campaigns/Email/List';

import { EmailCampaignPage } from '../containers/Campaigns/Email/Dashboard/index';

import { GoalsActionbar, GoalsTable } from '../containers/Campaigns/Goal/List';

import GoalDashboard from '../containers/Campaigns/Goal/Dashboard/GoalDashboard';

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
    contentComponent: EmailCampaignPage,
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
    path: '/campaigns/goals/:goalId(\\d+)',
    layout: 'main',
    contentComponent: GoalDashboard,
  },
  {
    path: '/campaigns/goals/:goalId/edit',
    layout: 'edit',
    editComponent: EditGoalPage,
  },
  {
    path: '/campaigns/goals/create',
    layout: 'edit',
    editComponent: EditGoalPage,
  },
];

export default campaignsRoutes;
