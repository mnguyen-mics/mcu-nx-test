import { DisplayCampaignsPage } from '../containers/Campaigns/Display/List';

import { DisplayCampaignPage, AdGroupPage } from '../containers/Campaigns/Display/Dashboard';

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

import { EmailCampaignsActionbar, EmailCampaignListPage } from '../containers/Campaigns/Email/List';

import { EmailCampaignPage } from '../containers/Campaigns/Email/Dashboard/index';

import { GoalsActionbar, GoalsTable } from '../containers/Campaigns/Goal/List';

import GoalDashboard from '../containers/Campaigns/Goal/Dashboard/GoalDashboard';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const campaignsDefinition: NavigatorDefinition = {
  campaignDisplayList: {
    path: '/campaigns/display',
    layout: 'main',
    contentComponent: DisplayCampaignsPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayCreation: {
    path: '/campaigns/display/create',
    layout: 'edit',
    editComponent: EditCampaignPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayEdition: {
    path: '/campaigns/display/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditCampaignPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayDashboard: {
    path: '/campaigns/display/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: DisplayCampaignPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayAdGroupDashboard: {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/:adGroupId(\\d+)',
    layout: 'main',
    contentComponent: AdGroupPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayAdGroupCreation: {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/create',
    layout: 'edit',
    editComponent: EditAdGroupPage,
    requiredFeature: 'campaigns-display',
  },
  campaignDisplayAdGroupEdition: {
    path: '/campaigns/display/:campaignId(\\d+)/adgroups/edit/:adGroupId(\\d+)',
    layout: 'edit',
    editComponent: EditAdGroupPage,
    requiredFeature: 'campaigns-display',
  },
  campaignEmailList: {
    path: '/campaigns/email',
    layout: 'main',
    contentComponent: EmailCampaignListPage,
    actionBarComponent: EmailCampaignsActionbar,
    requiredFeature: 'campaigns-email',
  },
  campaignEmailCreation: {
    path: '/campaigns/email/create',
    layout: 'edit',
    editComponent: EditEmailCampaignPage,
    requiredFeature: 'campaigns-email',
  },
  campaignEmailDashboard: {
    path: '/campaigns/email/:campaignId(\\d+)',
    layout: 'main',
    contentComponent: EmailCampaignPage,
    requiredFeature: 'campaigns-email',
  },
  campaignEmailEdition: {
    path: '/campaigns/email/:campaignId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditEmailCampaignPage,
    requiredFeature: 'campaigns-email',
  },
  campaignEmailBlastCreation: {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/create',
    layout: 'edit',
    editComponent: EditBlastPage,
    requiredFeature: 'campaigns-email',
  },
  campaignEmailBlastEdition: {
    path: '/campaigns/email/:campaignId(\\d+)/blasts/:blastId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditBlastPage,
    requiredFeature: 'campaigns-email',
  },
  campaignGoalList: {
    path: '/campaigns/goals',
    layout: 'main',
    contentComponent: GoalsTable,
    actionBarComponent: GoalsActionbar,
    requiredFeature: 'campaigns-goals',
    requireDatamart: true,
  },
  campaignGoalDashboard: {
    path: '/campaigns/goals/:goalId(\\d+)',
    layout: 'main',
    contentComponent: GoalDashboard,
    requiredFeature: 'campaigns-goals',
    requireDatamart: true,
  },
  goalEdition: {
    path: '/campaigns/goals/:goalId/edit',
    layout: 'edit',
    editComponent: EditGoalPage,
    requiredFeature: 'campaigns-goals',
    requireDatamart: true,
  },
  goalCreation: {
    path: '/campaigns/goals/create',
    layout: 'edit',
    editComponent: EditGoalPage,
    requiredFeature: 'campaigns-goals',
    requireDatamart: true,
  },
};

export const campaignRoutes: NavigatorRoute[] = generateRoutesFromDefinition(campaignsDefinition);
