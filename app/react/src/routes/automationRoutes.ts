import {
  ListActionbar,
  ListTable,
} from '../containers/Automations/List';

import AutomationEditPage from '../containers/Automations/Edit/AutomationEditPage';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const automationDefinition: NavigatorDefinition = {
  automationsList: {
    path: '/automations',
    layout: 'main',
    contentComponent: ListTable,
    actionBarComponent: ListActionbar,
    requiredFeature: 'automations',
    requireDatamart: true
  },
  automationsEdit: {
    path: '/automations/:automationId/edit',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations',
    requireDatamart: true
  },
  automationCreation: {
    path: '/automations/create',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations',
    requireDatamart: true
  },
}

export const automationRoutes: NavigatorRoute[] = generateRoutesFromDefinition(automationDefinition)
