import {
  DatamartSettings,
  DatamartSettingsActionBar,
  OrganisationSettings,
  OrganisationSettingsActionBar,
} from '../containers/Settings/index';

import MobileApplicationEditPage from '../containers/Settings/DatamartSettings/MobileApplications/Edit/MobileApplicationEditPage.tsx';
import SiteEditPage from '../containers/Settings/DatamartSettings/Sites/Edit/SiteEditPage.tsx';
import DatamartEditPage from '../containers/Settings/DatamartSettings/Datamarts/Edit/DatamartEditPage.tsx';

const settingsRoutes = [
  {
    path: '/settings/datamart',
    layout: 'main',
    contentComponent: DatamartSettings,
    actionBarComponent: DatamartSettingsActionBar,
  },
  {
    path: '/settings/organisation',
    layout: 'main',
    contentComponent: OrganisationSettings,
    actionBarComponent: OrganisationSettingsActionBar,
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
