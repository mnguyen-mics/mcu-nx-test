import {
  Account,
  AccountActionBar,
} from '../containers/Account';
import { RouteEdit, RouteStandard } from './routes';

const accountRoutes: Array<RouteEdit | RouteStandard> = [
  {
    path: '/account',
    layout: 'main',
    contentComponent: Account,
    actionBarComponent: AccountActionBar,
  },
];

export default accountRoutes;
