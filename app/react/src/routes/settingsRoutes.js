import {
  Settings,
  SettingsActionBar,
} from '../containers/Settings/index';

import MobileApplicationEditPage from '../containers/Settings/MobileApplications/Edit/MobileApplicationEditPage.tsx';

const settingsRoutes = [
  {
    path: '/settings',
    layout: 'main',
    contentComponent: Settings,
    actionBarComponent: SettingsActionBar,
  },
  {
    path: '/settings/mobile_application/create',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
  },
  {
    path: '/settings/mobile_application/:mobileApplicationId/edit',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
  },
];

export default settingsRoutes;
