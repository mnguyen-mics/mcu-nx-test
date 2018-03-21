import {
  OverviewContent,
  OverviewActionBar,
} from '../containers/Analytics/Overview';
import { NavigatorRoute } from './routes';

const analyticsRoutes: NavigatorRoute[] = [
  {
    path: '/analytics/overview',
    layout: 'main',
    contentComponent: OverviewContent,
    actionBarComponent: OverviewActionBar,
    requiredFeature: 'analytics.overview',
    requireDatamart: true
  },
];

export default analyticsRoutes;
