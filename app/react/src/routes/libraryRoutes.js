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
import ExportEditPage from '../containers/Library/Exports/Edit/ExportEditPage.tsx';

import { CreateEditAttributionModel } from '../containers/Library/AttributionModel/Edit/index.ts';
import { CreateEditBidOptimizer } from '../containers/Library/BidOptimizer/Edit/index.ts';
import { CreateEditEmailRouter } from '../containers/Library/EmailRouter/Edit/index.ts';
import { CreateEditVisitAnalyzer } from '../containers/Library/VisitAnalyzer/Edit/index.ts';
import { CreateEditRecommender } from '../containers/Library/Recommender/Edit/index.ts';
import KeywordListPage from '../containers/Library/Keyword/Edit/KeywordListPage.tsx';

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
    path: '/library/keywordslists',
    layout: 'main',
    ...KeywordList,
  },
  {
    path: '/library/keywordslist/:keywordsListId',
    layout: 'edit',
    editComponent: KeywordListPage,
  },
  {
    path: '/library/keywordslist',
    layout: 'edit',
    editComponent: KeywordListPage,
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
  //            BID OPTIMIZER
  // ========================================
  {
    path: '/library/bid_optimizers',
    layout: 'main',
    ...BidOptimizerList,
  },
  {
    path: '/library/bid_optimizers/:bidOptimizerId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEditBidOptimizer,
  },
  {
    path: '/library/bid_optimizers/create',
    layout: 'edit',
    editComponent: CreateEditBidOptimizer,
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
    editComponent: CreateEditAttributionModel,
  },
  {
    path: '/library/attribution_models/create',
    layout: 'edit',
    editComponent: CreateEditAttributionModel,
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
  {
    path: '/library/exports/create',
    layout: 'edit',
    editComponent: ExportEditPage
  },
  {
    path: '/library/exports/:exportId/edit',
    layout: 'edit',
    editComponent: ExportEditPage
  }
];

export default campaignsRoutes;
