import {
  AccountSettings,
  AccountSettingsActionBar
} from '../containers/Settings/index';

const settingsRoutes = [
  {
    path: '/settings',
    layout: 'main',
    contentComponent: AccountSettings,
    actionBarComponent: AccountSettingsActionBar
  }
];

export default settingsRoutes;
