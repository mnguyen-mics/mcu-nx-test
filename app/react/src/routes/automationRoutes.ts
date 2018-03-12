import {
  ListActionbar,
  ListTable,
} from '../containers/Automations/List';

import AutomationEditPage from '../containers/Automations/Edit/AutomationEditPage';

const automationRoutes = [
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
