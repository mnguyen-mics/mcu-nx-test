import {
    DashboardContent,
    DashboardActionBar,
} from '../containers/Analytics/Dashboard/index';

const analyticsRoutes = [
  {
    path: '/analytics/dashboard',
    layout: 'main',
    contentComponent: DashboardContent,
    actionBarComponent: DashboardActionBar,
  },
];

export default analyticsRoutes;
