import {
  Account,
  AccountActionBar
} from '../containers/Account/index';

const accountRoutes = [
  {
    path: '/account',
    layout: 'main',
    contentComponent: Account,
    actionBarComponent: AccountActionBar
  }
];

export default accountRoutes;
