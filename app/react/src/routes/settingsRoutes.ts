import {
  DatamartSettingsActionBar,
  OrganisationSettingsActionBar,
} from '../containers/Settings';

import { SitesListPage } from '../containers/Settings/DatamartSettings/Sites/List'
import { DatamartsListPage } from '../containers/Settings/DatamartSettings/Datamarts/List'
import { MobileApplicationsListPage } from '../containers/Settings/DatamartSettings/MobileApplications/List'

import { LabelsListPage } from '../containers/Settings/OrganisationSettings/Labels'
import UserListPage from '../containers/Settings/OrganisationSettings/Users/UserListPage'

import MobileApplicationEditPage from '../containers/Settings/DatamartSettings/MobileApplications/Edit/MobileApplicationEditPage';
import SiteEditPage from '../containers/Settings/DatamartSettings/Sites/Edit/SiteEditPage';
import DatamartEditPage from '../containers/Settings/DatamartSettings/Datamarts/Edit/DatamartEditPage';

const settingsRoutes = [
  {
    path: '/settings/datamart/sites',
    layout: 'settings',
    contentComponent: SitesListPage,
    actionBarComponent: DatamartSettingsActionBar,
  },
  {
    path: '/settings/datamart/mobile_applications',
    layout: 'settings',
    contentComponent: MobileApplicationsListPage,
    actionBarComponent: DatamartSettingsActionBar,
  },
  {
    path: '/settings/datamart/my_datamart',
    layout: 'settings',
    contentComponent: DatamartsListPage,
    actionBarComponent: DatamartSettingsActionBar,
  },
  {
    path: '/settings/organisation/labels',
    layout: 'settings',
    contentComponent: LabelsListPage,
    actionBarComponent: OrganisationSettingsActionBar,
  },
  {
    path: '/settings/organisation/users',
    layout: 'settings',
    contentComponent: UserListPage,
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
