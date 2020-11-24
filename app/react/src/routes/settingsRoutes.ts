import { DatamartsListPage } from '../containers/Settings/DatamartSettings/Datamarts/List';

import { LabelsListPage } from '../containers/Settings/OrganisationSettings/Labels';
import UserListPage from '../containers/Settings/OrganisationSettings/Users/List/UsersListsList';
import UserRoleListPage from '../containers/Settings/OrganisationSettings/UserRoles/List/UserRolesList';
import OrganisationAccount from '../containers/Settings/OrganisationSettings/OrganisationAccount/OrganisationAccount';

import { ProfileSettingsPage } from '../containers/Settings/ProfileSettings/Profile';

import MobileApplicationEditPage from '../containers/Settings/DatamartSettings/MobileApplications/Edit/MobileApplicationEditPage';
import SiteEditPage from '../containers/Settings/DatamartSettings/Sites/Edit/SiteEditPage';
import DatamartEditPage from '../containers/Settings/DatamartSettings/Datamarts/Edit/DatamartEditPage';

import { AttributionModelContent } from '../containers/Settings/CampaignSettings/AttributionModel/List';
import EditAttributionModelPage from '../containers/Settings/CampaignSettings/AttributionModel/Edit/EditAttributionModelPage';

import { EmailRouterContent } from '../containers/Settings/CampaignSettings/EmailRouter/List';
import { CreateEditEmailRouter } from '../containers/Settings/CampaignSettings/EmailRouter/Edit';

import { RecommenderContent } from '../containers/Settings/CampaignSettings/Recommender/List';
import { CreateEditRecommender } from '../containers/Settings/CampaignSettings/Recommender/Edit';

import { VisitAnalyzerContent } from '../containers/Settings/DatamartSettings/VisitAnalyzer/List';
import { CreateEditVisitAnalyzer } from '../containers/Settings/DatamartSettings/VisitAnalyzer/Edit';
import {
  NavigatorRoute,
  NavigatorDefinition,
  generateRoutesFromDefinition,
} from './domain';

import ServiceUsageReportListPage from '../containers/Settings/DatamartSettings/ServiceUsageReport/List/ServiceUsageReportListPage';
import EditUserPage from '../containers/Settings/OrganisationSettings/Users/Edit/EditUserPage';
import ApiTokenListPage from '../containers/Settings/ProfileSettings/ApiToken/List/ApiTokenListPage';
import EditApiTokenPage from '../containers/Settings/ProfileSettings/ApiToken/Edit/EditApiTokenPage';
import SubscribedOffersListPage from '../containers/Settings/ServicesSettings/SubscribedOffers/List/SubscribedOffersListPage';
import MyOffersPage from '../containers/Settings/ServicesSettings/MyOffers/MyOffersPage';
import SubscribedOfferServiceItemListPage from '../containers/Settings/ServicesSettings/SubscribedOffers/List/SubscribedOfferServiceItemListPage';
import MyOfferServiceItemListPage from '../containers/Settings/ServicesSettings/MyOffers/MyOfferServiceItemListPage';
import CreateOfferPage from '../containers/Settings/ServicesSettings/MyOffers/EditOfferPage';
import SourcesListPage from '../containers/Settings/DatamartSettings/Sources/List/SourcesListPage';
import DatamartViewPage from '../containers/Settings/DatamartSettings/Datamarts/Dashboard/DatamartDashboardPage';
import MlAlgorithmsPage from '../containers/Settings/DatamartSettings/MlAlgorithms/List/MlAlgorithmsPage';
import MlAlgorithmEditPage from '../containers/Settings/DatamartSettings/MlAlgorithms/Edit/MlAlgorithmEditPage';
import MlAlgorithmModelsPage from '../containers/Settings/DatamartSettings/MlAlgorithms/MlAlgorithmModels/MlAlgorithmModelsPage';
import { MlFunctionsContent } from '../containers/Settings/DatamartSettings/MlFunctions/List';
import CreateEditMlFunction from '../containers/Settings/DatamartSettings/MlFunctions/Edit/EditMlFunctionPage';
import ProcessingPage from '../containers/Settings/OrganisationSettings/Processings/List/ProcessingsList';
import ProcessingEditPage from '../containers/Settings/OrganisationSettings/Processings/Edit/ProcessingEditPage';
import CompartmentsListPage from '../containers/Settings/DatamartSettings/Compartments/CompartmentsListPage';
import CompartmentEditPage from '../containers/Settings/DatamartSettings/Compartments/Edit/CompartmentEditPage';
import DatamartReplicationEditPage from '../containers/Settings/DatamartSettings/DatamartReplication/Edit/DatamartReplicationEditPage';
import ChannelsListPage from '../containers/Settings/DatamartSettings/Channels/List/ChannelsListPage';
import { AudiencePartitionsPage } from '../containers/Settings/DatamartSettings/Partitions/List';
import Partition from '../containers/Settings/DatamartSettings/Partitions/Dashboard/Partition';
import AudiencePartitionPage from '../containers/Settings/DatamartSettings/Partitions/Edit/AudiencePartitionPage';
import CleaningRulesDashboardPage from '../containers/Settings/DatamartSettings/CleaningRules/Dashboard/CleaningRulesDashboardPage';
import CleaningRuleEditPage from '../containers/Settings/DatamartSettings/CleaningRules/Edit/CleaningRuleEditPage';
import EditUserRolePage from '../containers/Settings/OrganisationSettings/UserRoles/Edit/EditUserRolePage';
import AudienceFeatureEditPage from '../containers/Settings/DatamartSettings/AudienceBuilder/Edit/AudienceFeatureEditPage';

export const settingsDefinition: NavigatorDefinition = {
  /*
   *
   * DATAMART SETTINGS
   */

  // Sites (Edition)
  settingsDatamartSitesCreation: {
    path: '/settings/datamart/sites/create',
    layout: 'edit',
    editComponent: SiteEditPage,
    requiredFeature: 'datamartSettings-channels',
    requireDatamart: true,
  },

  settingsDatamartSitesEdition: {
    path: '/settings/datamart/:datamartId/sites/:siteId/edit',
    layout: 'edit',
    editComponent: SiteEditPage,
    requiredFeature: 'datamartSettings-channels',
    requireDatamart: true,
  },

  // Mobile Applications (Edition)
  settingsDatamartMobileAppCreation: {
    path: '/settings/datamart/mobile_application/create',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
    requiredFeature: 'datamartSettings-channels',
    requireDatamart: true,
  },
  settingsDatamartMobileAppEdition: {
    path:
      '/settings/datamart/:datamartId/mobile_application/:mobileApplicationId/edit',
    layout: 'edit',
    editComponent: MobileApplicationEditPage,
    requiredFeature: 'datamartSettings-channels',
    requireDatamart: true,
  },

  // Channels
  settingsDatamartChannelsList: {
    path: '/settings/datamart/channels',
    layout: 'settings',
    contentComponent: ChannelsListPage,
    requiredFeature: 'datamartSettings-channels',
    requireDatamart: true,
  },

  // Compartments
  settingsDatamartCompartments: {
    path: '/settings/datamart/compartments',
    layout: 'settings',
    contentComponent: CompartmentsListPage,
    requiredFeature: 'datamartSettings-compartments',
    requireDatamart: true,
  },
  settingsDatamartCompartmentsCreation: {
    path: '/settings/datamart/compartments/create',
    layout: 'edit',
    editComponent: CompartmentEditPage,
    requiredFeature: 'datamartSettings-compartments',
    requireDatamart: true,
  },
  settingsDatamartCompartmentsEdition: {
    path: '/settings/datamart/:datamartId/compartments/:compartmentId/edit',
    layout: 'edit',
    editComponent: CompartmentEditPage,
    requiredFeature: 'datamartSettings-compartments',
    requireDatamart: true,
  },

  // audience partitions
  settingsDatamartAudiencePartitionsList: {
    path: '/settings/datamart/audience/partitions',
    layout: 'settings',
    contentComponent: AudiencePartitionsPage,
    requiredFeature: 'datamartSettings-audience_partitions',
    requireDatamart: true,
  },
  settingsDatamartAudiencePartitionsEdit: {
    path: '/settings/datamart/audience/partitions/:partitionId/edit',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
    requiredFeature: 'datamartSettings-audience_partitions',
    requireDatamart: true,
  },
  settingsDatamartAudiencePartitionsCreate: {
    path: '/settings/datamart/audience/partitions/create',
    layout: 'edit',
    editComponent: AudiencePartitionPage,
    requiredFeature: 'datamartSettings-audience_partitions',
    requireDatamart: true,
  },
  settingsDatamartAudiencePartitionsDashboard: {
    path: '/settings/datamart/audience/partitions/:partitionId',
    layout: 'settings',
    contentComponent: Partition,
    requiredFeature: 'datamartSettings-audience_partitions',
  },
  // cleaning rules
  settingsDatamartCleaningRulesList: {
    path: '/settings/datamart/cleaning_rules',
    layout: 'settings',
    contentComponent: CleaningRulesDashboardPage,
    requireDatamart: true,
  },
  settingsDatamartUserEventCleaningRulesCreation: {
    path: '/settings/datamart/cleaning_rules/user_event/create',
    layout: 'edit',
    editComponent: CleaningRuleEditPage,
    requireDatamart: true,
  },
  settingsDatamartUserEventCleaningRulesEdition: {
    path: '/settings/datamart/:datamartId/cleaning_rules/user_event/:cleaningRuleId/edit',
    layout: 'edit',
    editComponent: CleaningRuleEditPage,
    requireDatamart: true,
  },
  settingsDatamartUserProfileCleaningRulesCreation: {
    path: '/settings/datamart/cleaning_rules/user_profile/create',
    layout: 'edit',
    editComponent: CleaningRuleEditPage,
    requireDatamart: true,
  },
  settingsDatamartUserProfileCleaningRulesEdition: {
    path: '/settings/datamart/:datamartId/cleaning_rules/user_profile/:cleaningRuleId/edit',
    layout: 'edit',
    editComponent: CleaningRuleEditPage,
    requireDatamart: true,
  },

  // datamart replication
  settingsDatamartReplicationCreation: {
    path: '/settings/datamart/datamart_replication/create',
    layout: 'edit',
    editComponent: DatamartReplicationEditPage,
    requiredFeature: 'datamartSettings-datamart_replication',
    requireDatamart: true,
  },
  settingsDatamartReplicationEdition: {
    path:
      '/settings/datamart/:datamartId/datamart_replication/:datamartReplicationId/edit',
    layout: 'edit',
    editComponent: DatamartReplicationEditPage,
    requiredFeature: 'datamartSettings-datamart_replication',
    requireDatamart: true,
  },

  // Audience Builder and audience feature
  settingsDatamartAudienceFeatureEdition: {
    path:
      '/settings/datamart/:datamartId/audience_feature/:audienceFeatureId/edit',
    layout: 'edit',
    editComponent: AudienceFeatureEditPage,
    requiredFeature: 'audience-segment_builder_v2',
    requireDatamart: true,
  },
  settingsDatamartAudienceFeatureCreation: {
    path:
      '/settings/datamart/:datamartId/audience_feature/create',
    layout: 'edit',
    editComponent: AudienceFeatureEditPage,
    requiredFeature: 'audience-segment_builder_v2',
    requireDatamart: true,
  },

  // datamart
  settingsDatamartDatamartList: {
    path: '/settings/datamart/datamarts',
    layout: 'settings',
    contentComponent: DatamartsListPage,
    requiredFeature: 'datamartSettings-datamarts',
    requireDatamart: true,
  },
  settingsDatamartDatamartView: {
    path: '/settings/datamart/datamarts/:datamartId',
    layout: 'settings',
    contentComponent: DatamartViewPage,
    requiredFeature: 'datamartSettings-datamarts',
    requireDatamart: true,
  },
  settingsDatamartDatamartEdition: {
    path: '/settings/datamart/datamarts/:datamartId/edit',
    layout: 'edit',
    editComponent: DatamartEditPage,
    requiredFeature: 'datamartSettings-datamarts',
    requireDatamart: true,
  },
  settingsDatamartServiceUsageReport: {
    path: '/settings/datamart/datamarts/:datamartId/service_usage_report',
    layout: 'settings',
    contentComponent: ServiceUsageReportListPage,
    requiredFeature: 'datamartSettings-service_usage_report',
    requireDatamart: true,
  },
  settingsDatamartSources: {
    path: '/settings/datamart/datamarts/:datamartId/sources',
    layout: 'settings',
    contentComponent: SourcesListPage,
    requiredFeature: 'datamartSettings-datamarts',
    requireDatamart: true,
  },

  // visit analyzer
  settingsDatamartVisitAnalyzerList: {
    path: '/settings/datamart/visit_analyzers',
    layout: 'settings',
    contentComponent: VisitAnalyzerContent,
    requiredFeature: 'datamartSettings-visit_analyzers',
    requireDatamart: true,
  },
  settingsDatamartVisitAnalyzerEdition: {
    path: '/settings/datamart/visit_analyzers/:visitAnalyzerId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
    requiredFeature: 'datamartSettings-visit_analyzers',
    requireDatamart: true,
  },
  settingsDatamartVisitAnalyzerCreation: {
    path: '/settings/datamart/visit_analyzers/create',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
    requiredFeature: 'datamartSettings-visit_analyzers',
    requireDatamart: true,
  },

  // ml function
  settingsDatamartMlFunctionList: {
    path: '/settings/datamart/ml_functions',
    layout: 'settings',
    contentComponent: MlFunctionsContent,
    requiredFeature: 'datamartSettings-ml_function',
    requireDatamart: true,
  },
  settingsDatamartMlFunctionEdition: {
    path: '/settings/datamart/ml_functions/:mlFunctionId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditMlFunction,
    requiredFeature: 'datamartSettings-ml_function',
    requireDatamart: true,
  },
  settingsDatamartMlFunctionCreation: {
    path: '/settings/datamart/ml_functions/create',
    layout: 'edit',
    editComponent: CreateEditMlFunction,
    requiredFeature: 'datamartSettings-ml_function',
    requireDatamart: true,
  },

  settingsDatamartMlAlgorithmList: {
    path: '/settings/datamart/ml_algorithms',
    layout: 'settings',
    contentComponent: MlAlgorithmsPage,
    requiredFeature: 'datamartSettings-mlAlgorithms',
  },
  settingsDatamartMlAlgorithmCreation: {
    path: '/settings/datamart/ml_algorithms/create',
    layout: 'edit',
    editComponent: MlAlgorithmEditPage,
    requiredFeature: 'datamartSettings-mlAlgorithms',
  },
  settingsDatamartMlAlgorithmEdit: {
    path: '/settings/datamart/ml_algorithms/:mlAlgorithmId/edit',
    layout: 'edit',
    editComponent: MlAlgorithmEditPage,
    requiredFeature: 'datamartSettings-mlAlgorithms',
  },
  settingsDatamartMlAlgorithmModelsList: {
    path: '/settings/datamart/ml_algorithms/:mlAlgorithmId/models',
    layout: 'settings',
    contentComponent: MlAlgorithmModelsPage,
    requiredFeature: 'datamartSettings-mlAlgorithms',
  },

  /*
  ORGANISATION SETTINGS
  */

  // labels
  settingsOrganisationLabelsList: {
    path: '/settings/organisation/labels',
    layout: 'settings',
    contentComponent: LabelsListPage,
    requiredFeature: 'organisationSettings-labels',
  },

  // profile
  settingsOrganisationProfileList: {
    path: '/settings/organisation/profile',
    layout: 'settings',
    contentComponent: OrganisationAccount,
    requiredFeature: 'organisationSettings-settings',
  },

  // users
  settingsOrganisationUserList: {
    path: '/settings/organisation/users',
    layout: 'settings',
    contentComponent: UserListPage,
    requiredFeature: 'organisationSettings-users',
  },
  settingsOrganisationUserEdition: {
    path: '/settings/organisation/users/:userId/edit',
    layout: 'edit',
    editComponent: EditUserPage,
    requiredFeature: 'organisationSettings-users',
  },
  settingsOrganisationUserCreation: {
    path: '/settings/organisation/users/create',
    layout: 'edit',
    editComponent: EditUserPage,
    requiredFeature: 'organisationSettings-users',
  },

  // user roles
  settingsOrganisationUserRoleList: {
    path: '/settings/organisation/user_roles',
    layout: 'settings',
    contentComponent: UserRoleListPage,
    requiredFeature: 'organisationSettings-user_roles',
  },
  settingsOrganisationUserRoleEdition: {
    path: '/settings/organisation/user_roles/:roleId/user/:userId/edit',
    layout: 'edit',
    editComponent: EditUserRolePage,
    requiredFeature: 'organisationSettings-user_roles',
  },

  // processings
  settingsOrganisationProcessingList: {
    path: '/settings/organisation/processings',
    layout: 'settings',
    contentComponent: ProcessingPage,
    requiredFeature: 'datamart-user_choices',
  },
  settingsOrganisationProcessingEdition: {
    path: '/settings/organisation/processings/:processingId/edit',
    layout: 'edit',
    editComponent: ProcessingEditPage,
    requiredFeature: 'datamart-user_choices',
  },
  settingsOrganisationProcessingCreation: {
    path: '/settings/organisation/processings/create',
    layout: 'edit',
    editComponent: ProcessingEditPage,
    requiredFeature: 'datamart-user_choices',
  },
  /*
  ACCOUNT SETTINGS
  
  */

  settingsAccountProfileList: {
    path: '/settings/account/my_profile',
    layout: 'settings',
    contentComponent: ProfileSettingsPage,
    requiredFeature: 'accountSettings-profile',
  },
  settingsAccountApiTokenList: {
    path: '/settings/account/api_tokens',
    layout: 'settings',
    contentComponent: ApiTokenListPage,
    requiredFeature: 'accountSettings-api_tokens',
  },
  settingsAccountApiTokenEdition: {
    path: '/settings/account/api_tokens/:apiTokenId/edit',
    layout: 'edit',
    editComponent: EditApiTokenPage,
    requiredFeature: 'accountSettings-api_tokens',
  },
  settingsAccountApiTokenCreation: {
    path: '/settings/account/api_tokens/create',
    layout: 'edit',
    editComponent: EditApiTokenPage,
    requiredFeature: 'accountSettings-api_tokens',
  },

  /*
  
    CAMPAIGNS SETTINGS

  */

  // attribution model
  settingsCampaignAttributionModelList: {
    path: '/settings/campaigns/attribution_models',
    layout: 'settings',
    contentComponent: AttributionModelContent,
    requiredFeature: 'campaignsSettings-attribution_models',
  },

  settingsCampaignAttributionModelEdition: {
    path:
      '/settings/campaigns/attribution_models/:attributionModelId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditAttributionModelPage,
    requiredFeature: 'campaignsSettings-attribution_models',
  },
  settingsCampaignAttributionModelCreation: {
    path: '/settings/campaigns/attribution_models/create',
    layout: 'edit',
    editComponent: EditAttributionModelPage,
    requiredFeature: 'campaignsSettings-attribution_models',
  },

  // email routers
  settingsCampaignEmailRouterList: {
    path: '/settings/campaigns/email_routers',
    layout: 'settings',
    contentComponent: EmailRouterContent,
    requiredFeature: 'campaignsSettings-email_routers',
  },
  settingsCampaignEmailRouterEdition: {
    path: '/settings/campaigns/email_routers/:emailRouterId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
    requiredFeature: 'campaignsSettings-email_routers',
  },
  settingsCampaignEmailRouterCreation: {
    path: '/settings/campaigns/email_routers/create',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
    requiredFeature: 'campaignsSettings-email_routers',
  },

  // recommenders
  settingsCampaignRecommenderList: {
    path: '/settings/campaigns/recommenders',
    layout: 'settings',
    contentComponent: RecommenderContent,
    requiredFeature: 'campaignsSettings-recommenders',
  },
  settingsCampaignRecommenderEdition: {
    path: '/settings/campaigns/recommenders/:recommenderId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditRecommender,
    requiredFeature: 'campaignsSettings-recommenders',
  },
  settingsCampaignRecommenderCreation: {
    path: '/settings/campaigns/recommenders/create',
    layout: 'edit',
    editComponent: CreateEditRecommender,
    requiredFeature: 'campaignsSettings-recommenders',
  },

  /*
  
    SERVICE OFFERS SETTINGS
  
  */

  settingsSubscribedOffersList: {
    path: '/settings/services/subscribed_offers',
    layout: 'settings',
    contentComponent: SubscribedOffersListPage,
    requiredFeature: 'servicesSettings-subscribed_offers',
  },
  settingsMyOffersList: {
    path: '/settings/services/my_offers',
    layout: 'settings',
    contentComponent: MyOffersPage,
    requiredFeature: 'servicesSettings-my_offers',
  },
  settingsSubscribedOfferServiceItemConditionList: {
    path:
      '/settings/services/subscribed_offers/:offerId/service_item_conditions',
    layout: 'settings',
    contentComponent: SubscribedOfferServiceItemListPage,
    requiredFeature: 'servicesSettings-subscribed_offers',
  },
  settingsMyOfferServiceItemConditionList: {
    path: '/settings/services/my_offers/:offerId/service_item_conditions',
    layout: 'settings',
    contentComponent: MyOfferServiceItemListPage,
    requiredFeature: 'servicesSettings-my_offers',
  },
  settingsMyOffersCreate: {
    path: '/settings/services/my_offers/create',
    layout: 'edit',
    editComponent: CreateOfferPage,
    requiredFeature: 'servicesSettings-my_offers',
  },
  settingsMyOffersEdit: {
    path: '/settings/services/my_offers/:offerId/edit',
    layout: 'edit',
    editComponent: CreateOfferPage,
    requiredFeature: 'servicesSettings-my_offers',
  },
  // settingsServiceCatalog: {
  //   path: '/settings/services/service_catalog',
  //   layout: 'settings',
  //   contentComponent: ServiceCatalogPage,
  //   requiredFeature: 'servicesSettings.my_service_catalog',
  // },
  // settingsMyOffers: {
  //   path: '/settings/services/my_offers',
  //   layout: 'settings',
  //   contentComponent: MyOffersPage,
  //   requiredFeature: 'servicesSettings.my_offers',
  // },
};

export const settingsRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  settingsDefinition,
);
