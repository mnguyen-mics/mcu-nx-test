export const itemDisplayedOnlyIfDatamart = ['audience', 'library.catalog', 'automations', 'campaigns.email'];


// ATTENTION : ALL KEYS MUST BE UNIQUE !
// AND MATCHED FEATURE FLAGS
const audienceMenu = {
  key: 'audience',
  iconType: 'users',
  path: '/audience',
  translationId: 'AUDIENCE',
  subMenuItems: [
    {
      key: 'audience.segments',
      path: '/audience/segments',
      translationId: 'AUDIENCE_SEGMENTS',
    },
    {
      key: 'audience.partitions',
      path: '/audience/partitions',
      translationId: 'AUDIENCE_PARTITIONS',
    },
    {
      key: 'audience.query_tool',
      path: '/datamart/queries',
      translationId: 'QUERY_TOOL',
      legacyPath: true,
    },
    {
      key: 'audience.monitoring',
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
      key: 'campaigns.display',
      path: '/campaigns/display',
      translationId: 'DISPLAY',
    },
    {
      key: 'campaigns.email',
      path: '/campaigns/email',
      translationId: 'EMAILS',
    },
    {
      key: 'campaigns.goals',
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
      key: 'creatives.display',
      path: '/creatives/display',
      translationId: 'DISPLAY',
    },
    {
      key: 'creatives.email',
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
      key: 'library.placements',
      path: '/library/placements',
      translationId: 'PLACEMENT_LIST',
    },
    {
      key: 'library.keywords',
      path: '/library/keywords',
      translationId: 'KEYWORD_LIST',
    },
    {
      key: 'library.bid_optimizers',
      path: '/library/bidOptimizers',
      translationId: 'BID_OPTIMIZER',
      legacyPath: true,
    },
    {
      key: 'library.attribution_models',
      path: '/library/attributionmodels',
      translationId: 'ATTRIBUTION_MODEL',
      legacyPath: true,
    },
    {
      key: 'library.visit_analyzers',
      path: '/library/visitanalysers',
      translationId: 'VISIT_ANALYZER',
      legacyPath: true,
    },
    {
      key: 'library.catalog',
      path: '/datamart/items',
      translationId: 'CATALOG',
      legacyPath: true,
    },
    {
      key: 'library.ad_layouts',
      path: '/library/adlayouts',
      translationId: 'AD_LAYOUTS',
      legacyPath: true,
    },
    {
      key: 'library.stylesheets',
      path: '/library/stylesheets',
      translationId: 'STYLESHEETS',
      legacyPath: true,
    },
    {
      key: 'library.assets',
      path: '/library/assets',
      translationId: 'ASSETS',
    },
    {
      key: 'library.exports',
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
