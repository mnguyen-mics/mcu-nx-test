import { automationDefinition } from './automationRoutes';
import { campaignsDefinition } from './campaignRoutes';
import { audienceDefinition } from './audienceRoutes';
import { creativesDefinition } from './creativeRoutes';
import { libraryDefinition } from './libraryRoutes';
import { settingsDefinition } from './settingsRoutes';
import { datastudioDefinition } from './datastudioRoutes';
import { marketplaceDefinition } from './marketplaceRoutes';

interface Redirect {
  from: string;
  to: string;
}

const redirects: Redirect[] = [
  // campaigns
  {
    from: '/campaigns/display',
    to: campaignsDefinition.campaignDisplayList.path,
  },
  {
    from: '/campaigns/email',
    to: campaignsDefinition.campaignEmailList.path,
  },
  {
    from: '/campaigns/select-campaign-template',
    to: campaignsDefinition.campaignDisplayList.path,
  },
  {
    from: '/campaigns/display/expert/edit/:campaignId',
    to: campaignsDefinition.campaignDisplayEdition.path,
  },
  {
    from: '/campaigns/display/expert/edit/:campaignId/edit-ad-group/:adGroupId',
    to: campaignsDefinition.campaignDisplayAdGroupEdition.path,
  },
  {
    from: '/campaigns/display/external/edit/:campaignId',
    to: campaignsDefinition.campaignDisplayEdition.path,
  },
  {
    from: '/campaigns/display/external/edit/:campaignId/edit-ad-group/:adGroupId',
    to: campaignsDefinition.campaignDisplayAdGroupEdition.path,
  },
  {
    from: '/goals/:goalId',
    to: campaignsDefinition.campaignGoalDashboard.path,
  },
  {
    from: '/library/goals',
    to: campaignsDefinition.campaignGoalList.path,
  },
  {
    from: '/goals/:goalId/report',
    to: campaignsDefinition.campaignGoalDashboard.path,
  },
  {
    from: '/library/assets',
    to: libraryDefinition.libraryAssetList.path,
  },
  {
    from: '/library/adlayouts',
    to: libraryDefinition.libraryAssetList.path,
  },
  {
    from: '/library/adlayouts/*',
    to: libraryDefinition.libraryAssetList.path,
  },
  {
    from: '/library/attributionmodels',
    to: settingsDefinition.settingsCampaignAttributionModelList.path,
  },
  {
    from: '/library/attributionmodels/:attributionModelId',
    to: settingsDefinition.settingsCampaignAttributionModelEdition.path,
  },
  {
    from: '/campaigns/email/edit/:campaignId',
    to: campaignsDefinition.campaignEmailEdition.path,
  },
  {
    from: '/campaigns/email/edit',
    to: campaignsDefinition.campaignEmailList.path,
  },
  {
    from: '/campaigns/email/report/:campaignId/:template',
    to: campaignsDefinition.campaignEmailDashboard.path,
  },
  {
    from: '/campaigns/display/keywords/:campaignId',
    to: campaignsDefinition.campaignDisplayEdition.path,
  },
  {
    from: '/campaigns/display/keywords',
    to: campaignsDefinition.campaignDisplayCreation.path,
  },
  {
    from: '/campaigns/display/report/:campaignId/:template',
    to: campaignsDefinition.campaignDisplayDashboard.path,
  },
  {
    from: '/creatives/display-ad',
    to: creativesDefinition.creativeDisplayList.path,
  },
  {
    from: '/creatives/email-template',
    to: creativesDefinition.creativeEmailList.path,
  },
  {
    from: '/creatives/display-ad/basic-editor/create',
    to: creativesDefinition.creativeDisplayCreation.path,
  },
  {
    from: '/creatives/display-ad/basic-editor/edit/:creativeId',
    to: creativesDefinition.creativeDisplayEdit.path,
  },
  {
    from: '/creatives/display-ad/default-editor/create',
    to: creativesDefinition.creativeDisplayCreation.path,
  },
  {
    from: '/creatives/display-ad/default-editor/edit/:creativeId',
    to: creativesDefinition.creativeDisplayEdit.path,
  },
  {
    from: '/creatives/display-ad/facebook/create',
    to: creativesDefinition.creativeDisplayCreation.path,
  },
  {
    from: '/creatives/email-template/default-editor/create',
    to: creativesDefinition.creativeEmailCreation.path,
  },
  {
    from: '/creatives/email-template/default-editor/edit/:creativeId',
    to: creativesDefinition.creativeEmailEdition.path,
  },
  {
    from: '/creatives/video-ad/default-editor/create',
    to: creativesDefinition.creativeDisplayCreation.path,
  },
  {
    from: '/creatives/video-ad/default-editor/edit/:creativeId',
    to: creativesDefinition.creativeDisplayEdit.path,
  },
  {
    from: '/datamart/overview',
    to: audienceDefinition.audienceSegmentList.path,
  },
  {
    from: '/datamart/items',
    to: libraryDefinition.libraryCatalogList.path,
  },
  {
    from: '/datamart/items/*',
    to: libraryDefinition.libraryCatalogList.path,
  },
  {
    from: '/datamart/categories',
    to: libraryDefinition.libraryCatalogList.path,
  },
  {
    from: '/datamart/categories/*',
    to: libraryDefinition.libraryCatalogList.path,
  },
  {
    from: '/datamart/segments',
    to: audienceDefinition.audienceSegmentList.path,
  },
  {
    from: '/datamart/segments/:type/:segmentId',
    to: audienceDefinition.audienceSegmentEdit.path,
  },
  {
    from: '/datamart/segments/:type/:segment_id/report',
    to: audienceDefinition.audienceSegmentDashboard.path,
  },
  {
    from: '/datamart/segments/:type',
    to: audienceDefinition.audienceSegmentCreation.path,
  },
  {
    from: '/datamart/partitions',
    to: audienceDefinition.audiencePartitionsList.path,
  },
  {
    from: '/datamart/partitions/:type/:partitionId/report',
    to: audienceDefinition.audiencePartitionsDashboard.path,
  },
  {
    from: '/datamart/partitions/:type/:partitionId',
    to: audienceDefinition.audiencePartitionsEdit.path,
  },
  {
    from: '/datamart/partitions/:type',
    to: audienceDefinition.audiencePartitionsCreate.path,
  },
  {
    from: '/datamart/monitoring',
    to: audienceDefinition.audienceTimeline.path,
  },
  {
    from: '/datamart/users/:userPointId',
    to: audienceDefinition.audienceTimeline.path,
  },
  {
    from: '/datamart/users/:identifierType/:identifierId',
    to: audienceDefinition.audienceTimeline.path,
  },
  {
    from: '/datamart/queries',
    to: audienceDefinition.audienceSegmentBuilder.path,
  },
  {
    from: '/datamart/queries/:queryId',
    to: audienceDefinition.audienceSegmentBuilder.path,
  },
  {
    from: '/library/exports',
    to: datastudioDefinition.datastudioExportList.path,
  },
  {
    from: '/library/exports/:exportId',
    to: datastudioDefinition.datastudioExportDashboard.path,
  },
  {
    from: '/library/exports/:exportId/edit',
    to: datastudioDefinition.datastudioExportDashboard.path,
  },
  {
    from: '/library/scenario',
    to: automationDefinition.automationsList.path,
  },
  {
    from: '/library/scenarios/:scenarioId',
    to: automationDefinition.automationsEdit.path,
  },
  {
    from: '/library/scenarios/',
    to: automationDefinition.automationBuilder.path,
  },
  {
    from: '/settings/useraccount',
    to: settingsDefinition.settingsAccountProfileList.path,
  },
  {
    from: '/settings/sites',
    to: settingsDefinition.settingsDatamartSitesList.path,
  },
  {
    from: '/settings/sites/edit/:siteId',
    to: settingsDefinition.settingsDatamartSitesEdition.path,
  },
  {
    from: '/settings/sites/new',
    to: settingsDefinition.settingsDatamartSitesCreation.path,
  },
  {
    from: '/settings/mobileapplications',
    to: settingsDefinition.settingsDatamartMobileAppList.path,
  },
  {
    from: '/settings/mobileapplications/edit/:mobileApplicationId',
    to: settingsDefinition.settingsDatamartMobileAppEdition.path,
  },
  {
    from: '/settings/mobileapplications/new',
    to: settingsDefinition.settingsDatamartMobileAppCreation.path,
  },
  {
    from: '/settings/serviceusage',
    to: settingsDefinition.settingsDatamartServiceUsageReport.path,
  },
  {
    from: '/settings/datamarts',
    to: settingsDefinition.settingsDatamartDatamartList.path,
  },
  {
    from: '/settings/datamarts/edit/:datamartId',
    to: settingsDefinition.settingsDatamartDatamartEdition.path,
  },
  {
    from: '/settings/datamarts/new',
    to: settingsDefinition.settingsDatamartDatamartEdition.path,
  },
  {
    from: '/library/stylesheets',
    to: libraryDefinition.libraryAssetList.path,
  },
  {
    from: '/library/stylesheets/*',
    to: libraryDefinition.libraryAssetList.path,
  },
  {
    from: '/library/visitanalysers',
    to: settingsDefinition.settingsDatamartVisitAnalyzerList.path,
  },
  {
    from: '/library/visitanalysers/:visitAnalyzerId',
    to: settingsDefinition.settingsDatamartVisitAnalyzerEdition.path,
  },
  {
    from: '/marketplace/offercatalog',
    to: marketplaceDefinition.marketplaceOfferCatalogList.path,
  },
];

export default redirects;
