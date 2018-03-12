import messages from './messages';

export const itemDisplayedOnlyIfDatamart = [
  'datamart',
];

export interface Menu {
  key: string;
  iconType?: string;
  path: string;
  translation: { id: string; defaultMessage: string };
  translationId?: string;
  legacyPath?: boolean;
  subMenuItems?: Menu[];
}
// ATTENTION : ALL KEYS MUST BE UNIQUE !
// AND MATCHED FEATURE FLAGS
const datamartSettings: Menu = {
  key: 'datamart',
  path: '/settings/datamart/',
  translation: messages.datamartSettingsTitle,
  subMenuItems: [
    {
      key: 'datamart.sites',
      path: '/settings/datamart/sites',
      translation: messages.siteSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamart.mobile_applications',
      path: '/settings/datamart/mobile_applications',
      translation: messages.mobileAppsSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamart.visit_analyzers',
      path: '/settings/datamart/visit_analyzers',
      translation: messages.visitAnalyzerSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'datamart.datamarts',
      path: '/settings/datamart/my_datamart',
      translation: messages.myDatamartSettingsTitle,
      legacyPath: false,
    },
  ],
};

const organisationSettings: Menu = {
  key: 'organisation',
  path: '/settings/organisation/',
  translation: messages.organisationSettingsTitle,
  subMenuItems: [
    {
      key: 'organisation.labels',
      path: '/settings/organisation/labels',
      translation: messages.labelsSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'organisation.settings',
      path: '/settings/organisation/profile',
      translation: messages.orgSettingsTitle,
      legacyPath: false,
    },
    {
      key: 'organisation.users',
      path: '/settings/organisation/users',
      translation: messages.usersSettingsTitle,
      legacyPath: false,
    },
  ],
};

const profileSettings: Menu = {
  key: 'account',
  path: '/settings/account/',
  translation: messages.accountSettingsTitle,
  subMenuItems: [
    {
      key: 'account.profile',
      path: '/settings/account/my_profile',
      translation: messages.accountSettingsProfile,
      legacyPath: false,
    },
  ],
};

const campaignSettings: Menu = {
  key: 'campaigns',
  path: '/settings/campaigns/',
  translation: messages.campaignSettingsTitle,
  subMenuItems: [
    {
      key: 'campaigns.bid_optimizer',
      path: '/settings/campaigns/bid_optimizer',
      translation: messages.campaignSettingsbidOptimizer,
      legacyPath: false,
    },
    {
      key: 'campaigns.attribution_models',
      path: '/settings/campaigns/attribution_models',
      translation: messages.campaignSettingsAttributionModels,
      legacyPath: false,
    },
    {
      key: 'campaigns.email_routers',
      path: '/settings/campaigns/email_routers',
      translation: messages.campaignSettingsEmailRouters,
      legacyPath: false,
    },
    {
      key: 'campaigns.recommenders',
      path: '/settings/campaigns/recommenders',
      translation: messages.campaignSettingsRecommenders,
      legacyPath: false,
    },
  ],
};

export const itemDefinitions: Menu[] = [profileSettings, organisationSettings, datamartSettings, campaignSettings];
