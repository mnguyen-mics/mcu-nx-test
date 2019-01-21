import AutomationEditPage from '../containers/Automations/Edit/AutomationEditPage';
import {
  NavigatorRoute,
  NavigatorDefinition,
  generateRoutesFromDefinition,
} from './domain';
import AutomationBuilderPage from '../containers/Automations/Builder/AutomationBuilderPage';
import AutomationListPage from '../containers/Automations/List/AutomationListPage';

export const automationDefinition: NavigatorDefinition = {
  automationsList: {
    path: '/automations/list',
    layout: 'main',
    contentComponent: AutomationListPage,
    requiredFeature: 'automations.list',
    requireDatamart: true,
  },
  automationsEdit: {
    path: '/automations/:automationId/edit',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations.list',
    requireDatamart: true,
  },
  automationCreation: {
    path: '/automations/create',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations.list',
    requireDatamart: true,
  },
  automationBuilder: {
    path: '/automations/builder',
    layout: 'main',
    contentComponent: AutomationBuilderPage,
    requiredFeature: 'automations.builder',
    requireDatamart: true,
  },
  automationBuilderEdit: {
    path: '/automations/builder/:automationId/edit',
    layout: 'main',
    contentComponent: AutomationBuilderPage,
    requiredFeature: 'automations.builder',
    requireDatamart: true,
  },
};

export const automationRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  automationDefinition,
);
