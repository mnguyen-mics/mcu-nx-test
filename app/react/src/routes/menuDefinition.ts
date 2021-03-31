import { campaignsDefinition } from './campaignRoutes';
import { automationDefinition } from './automationRoutes';
import { audienceDefinition } from './audienceRoutes';
import { creativesDefinition } from './creativeRoutes';
import { libraryDefinition } from './libraryRoutes';
import { datastudioDefinition } from './datastudioRoutes';
import { NavigatorMenuDefinition, generateMissingdefinitionItemFromRoute } from './domain';
import messages from '../containers/Menu/messages'
import { marketplaceDefinition } from './marketplaceRoutes';


const audienceMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'users',
  translation: messages.audienceTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.audienceHome),
      translation: messages.audienceHome
    },
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.audienceSegmentList),
      translation: messages.audienceSegment
    },
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.audienceFeedOverview),
      translation: messages.audienceFeeds
    },
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.segmentBuilder),
      translation: messages.segmentBuilder
    },
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.segmentBuilderSelector),
      translation: messages.builder
    },
    {
      ...generateMissingdefinitionItemFromRoute(audienceDefinition.audienceTimelineHome),
      translation: messages.audienceMonitoring
    },
  ]
}

const campaignsMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'display',
  translation: messages.campaignTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(campaignsDefinition.campaignDisplayList),
      translation: messages.campaignDisplay
    },
    {
      ...generateMissingdefinitionItemFromRoute(campaignsDefinition.campaignEmailList),
      translation: messages.campaignEmail
    },
    {
      ...generateMissingdefinitionItemFromRoute(campaignsDefinition.campaignGoalList),
      translation: messages.campaignGoals
    },
  ]
}

const automationsMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'automation',
  translation: messages.automationTitle,
  type: 'multi',
  mention: 'ALPHA',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(automationDefinition.automationsList),
      translation: messages.automationList
    },
    {
      ...generateMissingdefinitionItemFromRoute(automationDefinition.automationBuilder),
      translation: messages.automationBuilder
    },
  ]
}

const creativesMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'creative',
  translation: messages.creativesTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(creativesDefinition.creativeDisplayList),
      translation: messages.creativesDisplay,
    },
    {
      ...generateMissingdefinitionItemFromRoute(creativesDefinition.creativeNativeList),
      translation: messages.creativesNative,
    },
    {
      ...generateMissingdefinitionItemFromRoute(creativesDefinition.creativeEmailList),
      translation: messages.creativesEmails,
    },
  ]
}

const libraryMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'library',
  translation: messages.libraryTitle,
  type: 'multi',
  subMenuItems: [
    {
      path: '/library/adlayouts',
      requiredFeature: 'library.ad_layouts',
      translation: messages.libraryAdLayouts,
      legacyPath: true,
    },
    {
      requiredFeature: 'library.stylesheets',
      path: '/library/stylesheets',
      translation: messages.libraryStylesheets,
      legacyPath: true,
    },
    {
      ...generateMissingdefinitionItemFromRoute(libraryDefinition.libraryDealList),
      translation: messages.libraryDealList,
    },
    {
      ...generateMissingdefinitionItemFromRoute(libraryDefinition.libraryAssetList),
      translation: messages.libraryAssets,
    },
  ]
}

const datastudioMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'data',
  translation: messages.dataStudioTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(datastudioDefinition.datastudioQueryTool),
      translation: messages.dataStudioQuery,
    },
    {
      ...generateMissingdefinitionItemFromRoute(datastudioDefinition.datastudioFunnel),
      translation: messages.dataStudioFunnel,
      mention: 'ALPHA'
    },
    {
      ...generateMissingdefinitionItemFromRoute(datastudioDefinition.datastudioReport),
      translation: messages.dataStudioReport,
    },
    {
      ...generateMissingdefinitionItemFromRoute(datastudioDefinition.datastudioExportList),
      translation: messages.libraryExports,
    },
    {
      ...generateMissingdefinitionItemFromRoute(datastudioDefinition.datastudioImportList),
      translation: messages.libraryImports,
    },
  ]
}

const marketplaceMenuDefinition: NavigatorMenuDefinition = {
  iconType: 'warning',
  translation: messages.marketplaceTitle,
  type: 'multi',
  subMenuItems: [
    {
      ...generateMissingdefinitionItemFromRoute(marketplaceDefinition.marketplaceOfferCatalogList),
      translation: messages.marketplaceOfferCatalog,
    },
  ]
}




export const menuDefinitions: NavigatorMenuDefinition[] = [
  audienceMenuDefinition,
  campaignsMenuDefinition,
  automationsMenuDefinition,
  creativesMenuDefinition,
  libraryMenuDefinition,
  datastudioMenuDefinition,
  marketplaceMenuDefinition
];