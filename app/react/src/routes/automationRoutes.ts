import EditAutomationPage from '../containers/Automations/Edit/EditAutomationPage';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';
import AutomationBuilderPage from '../containers/Automations/Builder/AutomationBuilderPage';
import AutomationListPage from '../containers/Automations/List/AutomationListPage';
import AutomationDashboardPage from '../containers/Automations/Dashboard/AutomationDashboardPage';

export const automationDefinition: NavigatorDefinition = {
  automationBuilder: {
    path: '/automation-builder',
    layout: 'main',
    contentComponent: AutomationBuilderPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
  automationBuilderOld: {
    path: '/automation-builder-old',
    layout: 'edit',
    editComponent: EditAutomationPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
  automationBuilderEditOld: {
    path: '/automation-builder-old/:automationId',
    layout: 'edit',
    editComponent: EditAutomationPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
  automationsEdit: {
    path: '/automations/:automationId/edit',
    layout: 'main',
    contentComponent: EditAutomationPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
  automationsDashboard: {
    path: '/automations/:automationId',
    layout: 'main',
    contentComponent: AutomationDashboardPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
  automationsList: {
    path: '/automations',
    layout: 'main',
    contentComponent: AutomationListPage,
    requiredFeature: 'automations',
    requireDatamart: true,
  },
};

export const automationRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  automationDefinition,
);
