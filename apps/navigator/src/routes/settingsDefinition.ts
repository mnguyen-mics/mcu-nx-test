import { settingsDefinition } from './settingsRoutes';
import messages from '../containers/Menu/messages';
import { NavigatorMenuDefinition, generateMissingdefinitionItemFromRoute } from './domain';

const accountSettingsDefinition: NavigatorMenuDefinition = {
  iconType: 'users',
  translation: messages.accountSettingsTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsAccountProfileList),
      translation: messages.accountSettingsProfile,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsAccountApiTokenList),
      translation: messages.accountSettingsApiToken,
    },
  ],
};

const datamartSettingsDefinition: NavigatorMenuDefinition = {
  iconType: 'data',
  translation: messages.datamartSettingsTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsDatamartAudiencePartitionsList,
      ),
      translation: messages.audiencePartitionsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsDatamartChannelsList),
      translation: messages.channelsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsDatamartCompartments),
      translation: messages.compartmentsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsDatamartActivityAnalyzerList,
      ),
      translation: messages.activityAnalyzerSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsDatamartCustomActionList,
      ),
      translation: messages.customActionSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsDatamartMlFunctionList),
      translation: messages.mlFunctionSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsDatamartMlAlgorithmList),
      translation: messages.mlAlgorithmsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsDatamartCleaningRulesList,
      ),
      translation: messages.cleaningRulesSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsDatamartDatamartList),
      translation: messages.myDatamartSettingsTitle,
    },
  ],
};

const organisationSettingsDefinition: NavigatorMenuDefinition = {
  iconType: 'settings',
  translation: messages.organisationSettingsTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsOrganisationLabelsList),
      translation: messages.labelsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsOrganisationProfileList),
      translation: messages.orgSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsOrganisationUserList),
      translation: messages.usersSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsOrganisationProcessingList,
      ),
      translation: messages.processingsSettingsTitle,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsOrganisationIdentityProviderList,
      ),
      translation: messages.identityProvidersTitle,
      communityOnly: true,
    },
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsOrganisationDeviceIdRegistryList,
      ),
      translation: messages.deviceIdRegistriesSettingsTitle,
    },
  ],
};

const campaignSettingsDefinition: NavigatorMenuDefinition = {
  iconType: 'display',
  translation: messages.campaignSettingsTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(
        settingsDefinition.settingsCampaignAttributionModelList,
      ),
      translation: messages.campaignSettingsAttributionModels,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsCampaignEmailRouterList),
      translation: messages.campaignSettingsEmailRouters,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsCampaignRecommenderList),
      translation: messages.campaignSettingsRecommenders,
    },
  ],
};

const serviceSettingsDefinition: NavigatorMenuDefinition = {
  iconType: 'file',
  translation: messages.serviceOffersSettingsTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsSubscribedOffersList),
      translation: messages.subscribedOffersSettingsList,
    },
    {
      ...generateMissingdefinitionItemFromRoute(settingsDefinition.settingsMyOffersList),
      translation: messages.myOffersSettingsList,
    },
    // {
    //   ...generateMissingdefinitionItemFromRoute(
    //     settingsDefinition.settingsServiceCatalog,
    //   ),
    //   translation: messages.serviceCatalogSettingsList,
    // },
    // {
    //   ...generateMissingdefinitionItemFromRoute(
    //     settingsDefinition.settingsMyOffers,
    //   ),
    //   translation: messages.offersSettingsList,
    // },
  ],
};

export const settingsDefinitions: NavigatorMenuDefinition[] = [
  accountSettingsDefinition,
  organisationSettingsDefinition,
  datamartSettingsDefinition,
  campaignSettingsDefinition,
  serviceSettingsDefinition,
];
