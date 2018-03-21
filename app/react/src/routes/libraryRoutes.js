import AssetList from '../containers/Library/Asset/List/index.ts';
import KeywordList from '../containers/Library/Keyword/List/index.ts';
import PlacementList from '../containers/Library/Placement/List/index.ts';
import BidOptimizerList from '../containers/Library/BidOptimizer/List/index.ts';
import AttributionModelList from '../containers/Library/AttributionModel/List/index.ts';
import VisitAnalyzerList from '../containers/Library/VisitAnalyzer/List/index.ts';
import EmailRoutersList from '../containers/Library/EmailRouter/List/index.ts';
import RecommendersList from '../containers/Library/Recommender/List/index.ts';
import ExportsList from '../containers/Library/Exports/List/index.ts';
import Catalog from '../containers/Library/Catalog/index.ts';
import PlacementListPage from '../containers/Library/Placement/Edit/PlacementListPage.tsx';

import Exports from '../containers/Library/Exports/Dashboard/Exports.tsx';

import { EditAttributionModelPage } from '../containers/Lhrhrthrthibrary/AttributionModel/Edit/index.ts';
import { CreateEditBidOptimizer } from '../containers/Lirththrhrthbrary/BidOptimizer/Edit/index.ts';
import { CreateEditEmailRouter } from '../containers/Librththrthrary/EmailRouter/Edit/index.ts';
import { CreateEditVisitAnalyzer } from '../containers/Lihrthhrtbrary/VisitAnalyzer/Edit/index.ts';
import { CreateEditRecommender } from '../containers/Library/Recommender/Edit/index.ts';

const campaignsRoutes = [
  // ========================================
  //            Placements
  // ========================================
  {
    path: '/library/placements',
    layout: 'main',
    ...PlacementList,
  },
  {
    path: '/library/placementlists/:placementListId(\\d+)',
    layout: 'edit',
    editComponent: PlacementListPage,
  },
  {
    path: '/library/placementlists',
    layout: 'edit',
    editComponent: PlacementListPage,
  },
  // ========================================
  //            Keywords
  // ========================================
  {
    path: '/library/keywords',
    layout: 'main',
    ...KeywordList,
  },
  // ========================================
  //            Assets
  // ========================================
  {
    path: '/library/assets',
    layout: 'main',
    ...AssetList,
  },

  // ========================================
  //            Attribution Models
  // ========================================
  {
    path: '/library/attribution_models',
    layout: 'main',
    ...AttributionModelList,
  },
  {
    path: '/library/attribution_models/:attributionModelId(\\d+)/edit',
    layout: 'edit',
    editComponent: EditAttributionModelPage,
  },
  {
    path: '/library/attribution_models/create',
    layout: 'edit',
    editComponent: EditAttributionModelPage,
  },
  // ========================================
  //           Visit Analyzers
  // ========================================
  {
    path: '/library/visit_analyzers',
    layout: 'main',
    ...VisitAnalyzerList,
  },
  {
    path: '/library/visit_analyzers/:visitAnalyzerId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
  },
  {
    path: '/library/visit_analyzers/create',
    layout: 'edit',
    editComponent: CreateEditVisitAnalyzer,
  },
  // ========================================
  //           Email Routers
  // ========================================
  {
    path: '/library/email_routers',
    layout: 'main',
    ...EmailRoutersList,
  },
  {
    path: '/library/email_routers/:emailRouterId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
  },
  {
    path: '/library/email_routers/create',
    layout: 'edit',
    editComponent: CreateEditEmailRouter,
  },
  // ========================================
  //           Recommenders
  // ========================================
  {
    path: '/library/recommenders',
    layout: 'main',
    ...RecommendersList,
  },
  {
    path: '/library/recommenders/:recommenderId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditRecommender,
  },
  {
    path: '/library/recommenders/create',
    layout: 'edit',
    editComponent: CreateEditRecommender,
  },
  // ========================================
  //           CATALOG
  // ========================================
  {
    path: '/library/catalog',
    layout: 'main',
    ...Catalog,
  },
  // ========================================
  //           Exports
  // ========================================
  {
    path: '/library/exports',
    layout: 'main',
    ...ExportsList,
  },
  {
    path: '/library/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
  },
];

export default campaignsRoutes;
