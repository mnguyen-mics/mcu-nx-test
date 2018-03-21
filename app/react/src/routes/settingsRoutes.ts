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

import { BidOptimizerContent } from '../containers/Settings/CampaignSettings/BidOptimizer/List'
import { CreateEditBidOptimizer } from '../containers/Settings/CampaignSettings/BidOptimizer/Edit'

import { AttributionModelContent } from '../containers/Settings/CampaignSettings/AttributionModel/List'
import { CreateEditAttributionModel } from '../containers/Settings/CampaignSettings/AttributionModel/Edit'

import { EmailRouterContent } from '../containers/Settings/CampaignSettings/EmailRouter/List'
import { CreateEditEmailRouter } from '../containers/Settings/CampaignSettings/EmailRouter/Edit'

import { RecommenderContent } from '../containers/Settings/CampaignSettings/Recommender/List'
import { CreateEditRecommender } from '../containers/Settings/CampaignSettings/Recommender/Edit'

import { VisitAnalyzerContent } from '../containers/Settings/DatamartSettings/VisitAnalyzer/List'
import { CreateEditVisitAnalyzer } from '../containers/Settings/DatamartSettings/VisitAnalyzer/Edit'
import { NavigatorRoute } from './routes';

const settingsRoutes: NavigatorRoute[] = [
  /*
  *
  * DATAMART SETTINGS 
  */

  // sites

  {
    path: '/settings/datamart/sites',
    layout: 'settings',
    contentComponent: SitesListPage,
    requiredFeature: 'datamartSettings.sites',
    requireDatamart: true
  },

  {
    path: '/settings/datamart/sites/create',
    layout: 'edit',
    editComponent: SiteEditPage,
    requiredFeature: 'datamartSettings.sites',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/sites/:siteId/edit',
    layout: 'edit',
    editComponent: SiteEditPage,
    requiredFeature: 'datamartSettings.sites',
    requireDatamart: true
  },

  // mobile apps
  {
    path: '/settings/datamart/mobile_applications',
    layout: 'settings',
    contentComponent: MobileApplicationsListPage,
    requiredFeature: 'datamartSettings.mobile_applications',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/mobile_application/create',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
    requiredFeature: 'datamartSettings.mobile_applications',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/mobile_application/:mobileApplicationId/edit',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
    requiredFeature: 'datamartSettings.mobile_applications',
    requireDatamart: true
  },

  // datamart
  {
    path: '/settings/datamart/my_datamart',
    layout: 'settings',
    contentComponent: DatamartsListPage,
    requiredFeature: 'datamartSettings.datamarts',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/datamarts/:datamartId/edit',
    layout: 'edit',
    editComponent: DatamartEditPage,
    requiredFeature: 'datamartSettings.datamarts',
    requireDatamart: true
  },

  // visit analyzer
  {
    path: '/settings/datamart/visit_analyzers',
    layout: 'settings',
    contentComponent: VisitAnalyzerContent,
    requiredFeature: 'datamartSettings.visit_analyzers',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/visit_analyzers/:visitAnalyzerId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
    requiredFeature: 'datamartSettings.visit_analyzers',
    requireDatamart: true
  },
  {
    path: '/settings/datamart/visit_analyzers/create',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
    requiredFeature: 'datamartSettings.visit_analyzers',
    requireDatamart: true
  },

  /*

  ORGANISATION SETTINGS

  */

  // labels
  {
    path: '/settings/organisation/labels',
    layout: 'settings',
    contentComponent: LabelsListPage,
    requiredFeature: 'organisationSettings.labels',
  },

  // profile
  {
    path: '/settings/organisation/profile',
    layout: 'settings',
    contentComponent: OrganisationAccount,
    requiredFeature: 'organisationSettings.settings',
  },

  // users
  {
    path: '/settings/organisation/users',
    layout: 'settings',
    contentComponent: UserListPage,
    requiredFeature: 'organisationSettings.users',
  },
 
  
 
  /*

  ACCOUNT SETTINGS
  
  */
  
  {
    path: '/settings/account/my_profile',
    layout: 'settings',
    contentComponent: ProfileSettingsPage,
    requiredFeature: 'accountSettings.profile',
  },

  /*
  
    CAMPAIGNS SETTINGS
  
  */

  // bid optimizer
  {
    path: '/settings/campaigns/bid_optimizer',
    layout: 'settings',
    contentComponent: BidOptimizerContent,
    requiredFeature: 'campaignsSettings.bid_optimizers',
  },

  {
    path: '/settings/campaigns/bid_optimizer/:bidOptimizerId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditBidOptimizer,
    requiredFeature: 'campaignsSettings.bid_optimizers',
  },
  {
    path: '/settings/campaigns/bid_optimizer/create',
    layout: 'edit',
    editComponent: CreateEditBidOptimizer,
    requiredFeature: 'campaignsSettings.bid_optimizers',
  },

  // attribution model
  {
    path: '/settings/campaigns/attribution_models',
    layout: 'settings',
    contentComponent: AttributionModelContent,
    requiredFeature: 'campaignsSettings.attribution_models',
  },

  {
    path: '/settings/campaigns/attribution_models/:attributionModelId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditAttributionModel,
    requiredFeature: 'campaignsSettings.attribution_models',
  },
  {
    path: '/settings/campaigns/attribution_models/create',
    layout: 'edit',
    editComponent: CreateEditAttributionModel,
    requiredFeature: 'campaignsSettings.attribution_models',
  },

  // email routers

  {
    path: '/settings/campaigns/email_routers',
    layout: 'settings',
    contentComponent: EmailRouterContent,
    requiredFeature: 'campaignsSettings.email_routers',
  },
  {
    path: '/settings/campaigns/email_routers/:emailRouterId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
    requiredFeature: 'campaignsSettings.email_routers',
  },
  {
    path: '/settings/campaigns/email_routers/create',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
    requiredFeature: 'campaignsSettings.email_routers',
  },

  // recommenders

  {
    path: '/settings/campaigns/recommenders',
    layout: 'settings',
    contentComponent: RecommenderContent,
    requiredFeature: 'campaignsSettings.recommenders',
  },
  {
    path: '/settings/campaigns/recommenders/:recommenderId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditRecommender,
    requiredFeature: 'campaignsSettings.recommenders',
  },
  {
    path: '/settings/campaigns/recommenders/create',
    layout: 'edit',
    editComponent: CreateEditRecommender,
    requiredFeature: 'campaignsSettings.recommenders',
  },

];

export default settingsRoutes;