import messages from './messages';
import { NavigatorMenuElement } from './domain';

export const itemDisplayedOnlyIfDatamart = [
  'datamartSettings',
];

// ATTENTION : ALL KEYS MUST BE UNIQUE !
// AND MATCHED FEATURE FLAGS
const datamartSettings: NavigatorMenuElement = {
  key: 'datamartSettings',
  path: '/settings/datamart/',
  translation: messages.datamartSettingsTitle,
  subMenuItems: [
    {
      key: 'datamartSettings.sites',
      path: '/settings/datamart/sites',
      translation: messages.siteSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamartSettings.mobile_applications',
      path: '/settings/datamart/mobile_applications',
      translation: messages.mobileAppsSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamartSettings.visit_analyzers',
      path: '/settings/datamart/visit_analyzers',
      translation: messages.visitAnalyzerSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamartSettings.datamarts',
      path: '/settings/datamart/my_datamart',
      translation: messages.myDatamartSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamartSettings.service_usage_report',
      path: '/settings/datamart/service_usage_report',
      translation: messages.serviceUsageReportSettingsTitle,
      legacyPath: false,
    },
  ],
};

const organisationSettings: NavigatorMenuElement = {
  key: 'organisationSettings',
  path: '/settings/organisation/',
  translation: messages.organisationSettingsTitle,
  subMenuItems: [
    {
      key: 'organisationSettings.labels',
      path: '/settings/organisation/labels',
      translation: messages.labelsSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'organisationSettings.settings',
      path: '/settings/organisation/profile',
      translation: messages.orgSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'organisationSettings.users',
      path: '/settings/organisation/users',
      translation: messages.usersSettingsTitle,
      legacyPath: false,
    },
  ],
};

const profileSettings: NavigatorMenuElement = {
  key: 'accountSettings',
  path: '/settings/account/',
  translation: messages.accountSettingsTitle,
  subMenuItems: [
    {
      key: 'accountSettings.profile',
      path: '/settings/account/my_profile',
      translation: messages.accountSettingsProfile,
      legacyPath: false,
    },
  ],
};

const campaignSettings: NavigatorMenuElement = {
  key: 'campaignsSettings',
  path: '/settings/campaigns/',
  translation: messages.campaignSettingsTitle,
  subMenuItems: [
    {
      key: 'campaignsSettings.bid_optimizer',
      path: '/settings/campaigns/bid_optimizer',
      translation: messages.campaignSettingsbidOptimizer,
      legacyPath: false,
    },
    {
      key: 'campaignsSettings.attribution_models',
      path: '/settings/campaigns/attribution_models',
      translation: messages.campaignSettingsAttributionModels,
      legacyPath: false,
    },
    {
      key: 'campaignsSettings.email_routers',
      path: '/settings/campaigns/email_routers',
      translation: messages.campaignSettingsEmailRouters,
      legacyPath: false,
    },
    {
      key: 'campaignsSettings.recommenders',
      path: '/settings/campaigns/recommenders',
      translation: messages.campaignSettingsRecommenders,
      legacyPath: false,
    },
  ],
};

export const settingsDefinitions: NavigatorMenuElement[] = [profileSettings, organisationSettings, datamartSettings, campaignSettings];
