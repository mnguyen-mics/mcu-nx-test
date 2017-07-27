import {
  Settings,
  SettingsActionBar
} from '../containers/Settings/index';

const settingsRoutes = [
  {
    path: '/settings',
    layout: 'main',
    contentComponent: Settings,
    actionBarComponent: SettingsActionBar
  }
];

export default settingsRoutes;
