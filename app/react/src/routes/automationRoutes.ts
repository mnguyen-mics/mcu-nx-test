import {
  ListActionbar,
  ListTable,
} from '../containers/Automations/List';

import AutomationEditPage from '../containers/Automations/Edit/AutomationEditPage';
import { NavigatorRoute } from './routes';

const automationRoutes: NavigatorRoute[] = [
  {
    path: '/automations',
    layout: 'main',
    contentComponent: ListTable,
    actionBarComponent: ListActionbar,
    requiredFeature: 'automations',
    requireDatamart: true
  },
  {
    path: '/automations/:automationId/edit',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations',
    requireDatamart: true
  },
  {
    path: '/automations/create',
    layout: 'edit',
    editComponent: AutomationEditPage,
    requiredFeature: 'automations',
    requireDatamart: true
  },
];

export default automationRoutes;
