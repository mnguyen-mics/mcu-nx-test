import {
  DisplayCampaignsPage,
} from '../containers/Campaigns/Display/List';

import {
  DisplayCampaignPage,
  AdGroupPage,
} from '../containers/Campaigns/Display/Dashboard';

import {
  EditAdGroupPage,
} from '../containers/Campaigns/Display/Edit/AdGroup';

import {
  EditCampaignPage,
} from '../containers/Campaigns/Display/Edit';

// import {
//   CreateEmailPage,
//   EditEmailPage,
//   CreateBlastPage,
// } from '../containers/Campaigns/Email/Edit';

import EditBlastPage from '../containers/Campaigns/Email/Edit/Blast/EditBlastPage';
import EditEmailCampaignPage from '../containers/Campaigns/Email/Edit/Campaign/EditCampaignPage';

import {
  EmailCampaignsActionbar,
  EmailCampaignListPage,
} from '../containers/Campaigns/Email/List';

import { EmailCampaignPage } from '../containers/Campaigns/Email/Dashboard';

import { GoalsActionbar, GoalsTable } from '../containers/Campaigns/Goal/List';

import GoalDashboard from '../containers/Campaigns/Goal/Dashboard/GoalDashboard';
import { NavigatorRoute } from './routes';

const campaignsRoutes: NavigatorRoute[] = [
  {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: DisplayCampaignsPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/create',
    layout: 'edit',
    editComponent: EditCampaignPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditCampaignPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: DisplayCampaignPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/:adGroupId(\\d+)',
    layout: 'main',
    contentComponent: AdGroupPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/create',
    layout: 'edit',
    editComponent: EditAdGroupPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/edit/:adGroupId(\\d+)',
    layout: 'edit',
    editComponent: EditAdGroupPage,
    requiredFeature: 'campaigns.display'
  },
  {
    path: '/campaigns/email',
    layout: 'main',
    contentComponent: EmailCampaignListPage,
    actionBarComponent: EmailCampaignsActionbar,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/email/create',
    layout: 'edit',
    editComponent: EditEmailCampaignPage,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: EmailCampaignPage,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditEmailCampaignPage,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/create',
    layout: 'edit',
    editComponent: EditBlastPage,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/:blastId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditBlastPage,
    requiredFeature: 'campaigns.email'
  },
  {
    path: '/campaigns/goal',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar,
    requiredFeature: 'campaigns.goals',
    requireDatamart: true
  },
  {
    path: '/campaigns/goal/:goalId(\\d+)',
    layout: 'main',
    contentComponent: GoalDashboard,
    requiredFeature: 'campaigns.goals',
    requireDatamart: true
  },
];

export default campaignsRoutes;
