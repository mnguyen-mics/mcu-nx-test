import {
  ListActionbar,
  ListTable,
} from '../containers/Automations/List';

const automationRoutes = [
  {
    path: '/automations',
    layout: 'main',
    contentComponent: ListTable,
    actionBarComponent: ListActionbar,
  },
];

export default automationRoutes;
