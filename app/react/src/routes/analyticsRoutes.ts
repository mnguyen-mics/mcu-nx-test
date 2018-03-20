import {
  OverviewContent,
  OverviewActionBar,
} from '../containers/Analytics/Overview';
import { RouteEdit, RouteStandard } from './routes';

const analyticsRoutes: Array<RouteEdit | RouteStandard> = [
  {
    path: '/analytics/overview',
    layout: 'main',
    contentComponent: OverviewContent,
    actionBarComponent: OverviewActionBar,
  },
];

export default analyticsRoutes;
