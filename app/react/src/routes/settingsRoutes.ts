import { SitesListPage } from '../containers/Settings/DatamartSettings/Sites/List'
import { DatamartsListPage } from '../containers/Settings/DatamartSettings/Datamarts/List'
import { MobileApplicationsListPage } from '../containers/Settings/DatamartSettings/MobileApplications/List'

import { LabelsListPage } from '../containers/Settings/OrganisationSettings/Labels'
import UserListPage from '../containers/Settings/OrganisationSettings/Users/UserListPage'
import OrganisationAccount from '../containers/Settings/OrganisationSettings/OrganisationAccount/OrganisationAccount'

import { ProfileSettingsPage } from '../containers/Settings/ProfileSettings/'

import MobileApplicationEditPage from '../containers/Settings/DatamartSettings/MobileApplications/Edit/MobileApplicationEditPage';
import SiteEditPage from '../containers/Settings/DatamartSettings/Sites/Edit/SiteEditPage';
import DatamartEditPage from '../containers/Settings/DatamartSettings/Datamarts/Edit/DatamartEditPage';

const settingsRoutes = [
  {
    path: '/settings/datamart/sites',
    layout: 'settings',
    contentComponent: SitesListPage,
  },
  {
    path: '/settings/datamart/mobile_applications',
    layout: 'settings',
    contentComponent: MobileApplicationsListPage,
  },
  {
    path: '/settings/datamart/my_datamart',
    layout: 'settings',
    contentComponent: DatamartsListPage,
  },
  {
    path: '/settings/organisation/labels',
    layout: 'settings',
    contentComponent: LabelsListPage,
  },
  {
    path: '/settings/organisation/settings',
    layout: 'settings',
    contentComponent: OrganisationAccount,
  },
  {
    path: '/settings/organisation/users',
    layout: 'settings',
    contentComponent: UserListPage,
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
  
  {
    path: '/settings/account/my_profile',
    layout: 'settings',
    contentComponent: ProfileSettingsPage,
  },
];

export default settingsRoutes;
