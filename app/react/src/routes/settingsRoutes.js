import {
  Settings,
  SettingsActionBar,
} from '../containers/Settings/index';

import MobileApplicationEditPage from '../containers/Settings/MobileApplications/Edit/MobileApplicationEditPage.tsx';
import SiteEditPage from '../containers/Settings/Sites/Edit/SiteEditPage.tsx';
import DatamartEditPage from '../containers/Settings/Datamarts/Edit/DatamartEditPage.tsx';

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
  {
    path: '/settings/sites/create',
    layout: 'edit',
    editComponent: SiteEditPage,
  },
  {
    path: '/settings/sites/:siteId/edit',
    layout: 'edit',
    editComponent: SiteEditPage,
  },
  {
    path: '/settings/datamarts/:datamartId/edit',
    layout: 'edit',
    editComponent: DatamartEditPage,
  },
];

export default settingsRoutes;
