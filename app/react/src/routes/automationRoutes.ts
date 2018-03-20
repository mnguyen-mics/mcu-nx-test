import {
  ListActionbar,
  ListTable,
} from '../containers/Automations/List';

import AutomationEditPage from '../containers/Automations/Edit/AutomationEditPage';
import { RouteEdit, RouteStandard } from './routes';

const automationRoutes: Array<RouteEdit | RouteStandard> = [
  {
    path: '/automations',
    layout: 'main',
    contentComponent: ListTable,
    actionBarComponent: ListActionbar,
  },
  {
    path: '/automations/:automationId/edit',
    layout: 'edit',
    editComponent: AutomationEditPage,
  },
  {
    path: '/automations/create',
    layout: 'edit',
    editComponent: AutomationEditPage,
  },
];

export default automationRoutes;
