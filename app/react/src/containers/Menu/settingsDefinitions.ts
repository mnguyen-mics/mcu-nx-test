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
      key: 'organisation.users',
      path: '/settings/organisation/users',
      translation: messages.usersSettingsTitle,
      legacyPath: false,
    },
  ],
};

export const itemDefinitions: Menu[] = [organisationSettings, datamartSettings];
