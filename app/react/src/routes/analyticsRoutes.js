import {
    OverviewContent,
    OverviewActionBar,
} from '../containers/Analytics/Overview/index';

const analyticsRoutes = [
  {
    path: '/analytics/overview',
    layout: 'main',
    contentComponent: OverviewContent,
    actionBarComponent: OverviewActionBar,
  },
];

export default analyticsRoutes;
