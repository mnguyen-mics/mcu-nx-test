import messages from './messages';

export const itemDisplayedOnlyIfDatamart = ['audience', 'library.catalog', 'automations', 'campaigns.email', 'datastudio.query_tool'];


// ATTENTION : ALL KEYS MUST BE UNIQUE !
// AND MATCHED FEATURE FLAGS
const audienceMenu = {
  key: 'audience',
  iconType: 'users',
  path: '/audience',
  translation: messages.audienceTitle,
  subMenuItems: [
    {
      key: 'audience.segments',
      path: '/audience/segments',
      translation: messages.audienceSegment,
      legacyPath: false,
    },
    {
      key: 'audience.partitions',
      path: '/audience/partitions',
      translation: messages.audiencePartitions,
      legacyPath: false,
    },
    {
      key: 'audience.segment_builder',
      path: '/datamart/queries',
      translation: messages.audienceSegmentBuilder,
      legacyPath: true,
    },
    {
      key: 'audience.monitoring',
      path: '/audience/timeline',
      translation: messages.audienceMonitoring,
      legacyPath: false,
    },
  ],
};

const campaignsMenu = {
  key: 'campaigns',
  iconType: 'display',
  path: '/campaigns',
  translation: messages.campaignTitle,
  subMenuItems: [
    {
      key: 'campaigns.display',
      path: '/campaigns/display',
      translation: messages.campaignDisplay,
      legacyPath: false,
    },
    {
      key: 'campaigns.email',
      path: '/campaigns/email',
      translation: messages.campaignEmail,
      legacyPath: false,
    },
    {
      key: 'campaigns.goals',
      path: '/campaigns/goal',
      translation: messages.campaignGoals,
      legacyPath: false,
    },
  ],
};

const automationsMenu = {
  key: 'automations',
  iconType: 'automation',
  path: '/automations',
  translation: messages.automationTitle,
  subMenuItems: [],
};

const creativesMenu = {
  key: 'creatives',
  iconType: 'creative',
  path: '/creatives',
  translation: messages.creativesTitle,
  subMenuItems: [
    {
      key: 'creatives.display',
      path: '/creatives/display',
      translation: messages.creativesDisplay,
      legacyPath: false,
    },
    {
      key: 'creatives.email',
      path: '/creatives/email',
      translation: messages.creativesEmails,
      legacyPath: false,
    },
  ],
};

const libraryMenu = {
  key: 'library',
  iconType: 'library',
  path: '/library',
  translation: messages.libraryTitle,
  subMenuItems: [
    {
      key: 'library.placements',
      path: '/library/placements',
      translation: messages.libraryPlacement,
      legacyPath: false,
    },
    {
      key: 'library.keywords',
      path: '/library/keywords',
      translation: messages.libraryKeyword,
      legacyPath: false,
    },
    {
      key: 'library.bid_optimizers',
      path: '/library/bid_optimizers',
      translation: messages.libraryBidOptimizer,
      legacyPath: false,
    },
    {
      key: 'library.attribution_models',
      path: '/library/attribution_models',
      translation: messages.libraryAttributionModel,
      legacyPath: false,
    },
    {
      key: 'library.visit_analyzers',
      path: '/library/visit_analyzers',
      translation: messages.libraryVisitAnalyzer,
      legacyPath: false,
    },
    {
      key: 'library.email_routers',
      path: '/library/email_routers',
      translation: messages.libraryEmailRouter,
      legacyPath: false,
    },
    {
      key: 'library.recommenders',
      path: '/library/recommenders',
      translation: messages.libraryRecommenders,
      legacyPath: false,
    },
    {
      key: 'library.catalog',
      path: '/datamart/items',
      translation: messages.libraryCatalog,
      legacyPath: true,
    },
    // TO REMOVE WHEN AD RENDERER ARE CREATED
    {
      key: 'library.ad_layouts',
      path: '/library/adlayouts',
      translation: messages.libraryAdLayouts,
      legacyPath: true,
    },
    {
      key: 'library.stylesheets',
      path: '/library/stylesheets',
      translation: messages.libraryStylesheets,
      legacyPath: true,
    },
    {
      key: 'library.assets',
      path: '/library/assets',
      translation: messages.libraryAssets,
      legacyPath: false,
    },
    {
      key: 'library.exports',
      path: '/library/exports',
      translation: messages.libraryExports,
      legacyPath: false,
    },
  ],
};

const dataStudio = {
  key: 'datastudio',
  iconType: 'data',
  path: '/datastudio',
  translation: messages.dataStudioTitle,
  subMenuItems: [
    {
      key: 'datastudio.query_tool',
      path: '/datamart/queries',
      translation: messages.dataStudioQuery,
      legacyPath: true,
    },
    {
      key: 'datastudio.report',
      path: '/datastudio/report',
      translation: messages.dataStudioReport,
      legacyPath: false,
    }
  ],
};

export const itemDefinitions = [
  audienceMenu,
  campaignsMenu,
  automationsMenu,
  creativesMenu,
  libraryMenu,
  dataStudio,
];
