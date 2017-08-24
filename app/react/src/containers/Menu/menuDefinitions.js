export const itemDisplayedOnlyIfDatamart = ['audience', 'library_catalog', 'automations', 'email_campaigns'];


// ATTENTION : ALL KEYS MUST BE UNIQUE !
const audienceMenu = {
  key: 'audience',
  iconType: 'users',
  path: '/audience',
  translationId: 'AUDIENCE',
  subMenuItems: [
    {
      key: 'audience_segments',
      path: '/audience/segments',
      translationId: 'AUDIENCE_SEGMENTS',
    },
    {
      key: 'audience_partitions',
      path: '/audience/partitions',
      translationId: 'AUDIENCE_PARTITIONS',
    },
    {
      key: 'audience_queries',
      path: '/datamart/queries',
      translationId: 'QUERY_TOOL',
      legacyPath: true,
    },
    {
      key: 'audience_monitoring',
      path: '/audience/timeline',
      translationId: 'MONITORING',
    },
  ],
};

const campaignsMenu = {
  key: 'campaigns',
  iconType: 'display',
  path: '/campaigns',
  translationId: 'CAMPAIGNS',
  subMenuItems: [
    {
      key: 'display_campaigns',
      path: '/campaigns/display',
      translationId: 'DISPLAY',
    },
    {
      key: 'email_campaigns',
      path: '/campaigns/email',
      translationId: 'EMAILS',
    },
    {
      key: 'campaigns_goals',
      path: '/campaigns/goal',
      translationId: 'GOALS',
    },
  ],
};

const automationsMenu = {
  key: 'automations',
  iconType: 'automation',
  path: '/automations',
  translationId: 'AUTOMATIONS_LIST',
};

const creativesMenu = {
  key: 'creatives',
  iconType: 'creative',
  path: '/creatives',
  translationId: 'CREATIVES',
  subMenuItems: [
    {
      key: 'creatives_display_ads',
      path: '/creatives/display',
      translationId: 'DISPLAY',
    },
    {
      key: 'creatives_email_templates',
      path: '/creatives/email',
      translationId: 'EMAILS',
    },
  ],
};

const libraryMenu = {
  key: 'library',
  iconType: 'library',
  path: '/library',
  translationId: 'LIBRARY',
  subMenuItems: [
    {
      key: 'library_placements',
      path: '/library/placements',
      translationId: 'PLACEMENT_LIST',
    },
    {
      key: 'library_keywords',
      path: '/library/keywords',
      translationId: 'KEYWORD_LIST',
    },
    {
      key: 'library_bidOptimizers',
      path: '/library/bidOptimizers',
      translationId: 'BID_OPTIMIZER',
      legacyPath: true,
    },
    {
      key: 'library_attributionmodels',
      path: '/library/attributionmodels',
      translationId: 'ATTRIBUTION_MODEL',
      legacyPath: true,
    },
    {
      key: 'library_visitanalysers',
      path: '/library/visitanalysers',
      translationId: 'VISIT_ANALYZER',
      legacyPath: true,
    },
    {
      key: 'library_catalog',
      path: '/datamart/items',
      translationId: 'CATALOG',
      legacyPath: true,
    },
    {
      key: 'library_adlayouts',
      path: '/library/adlayouts',
      translationId: 'AD_LAYOUTS',
      legacyPath: true,
    },
    {
      key: 'library_stylesheets',
      path: '/library/stylesheets',
      translationId: 'STYLESHEETS',
      legacyPath: true,
    },
    {
      key: 'library_assets',
      path: '/library/assets',
      translationId: 'ASSETS',
    },
    {
      key: 'library_exports',
      path: '/library/exports',
      translationId: 'EXPORTS',
      legacyPath: true,
    },
  ],
};

export const itemDefinitions = [
  audienceMenu,
  campaignsMenu,
  automationsMenu,
  creativesMenu,
  libraryMenu,
];
