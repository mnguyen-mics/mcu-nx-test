import AssetList from '../containers/Library/Asset/List';
import KeywordList from '../containers/Library/Keyword/List';
import PlacementList from '../containers/Library/Placement/List';
import BidOptimizerList from '../containers/Library/BidOptimizer/List';
import AttributionModelList from '../containers/Library/AttributionModel/List';
import VisitAnalyzerList from '../containers/Library/VisitAnalyzer/List';
import EmailRoutersList from '../containers/Library/EmailRouter/List';
import RecommendersList from '../containers/Library/Recommender/List';
import ExportsList from '../containers/Library/Exports/List';
import Catalog from '../containers/Library/Catalog';

import Exports from '../containers/Library/Exports/Dashboard/Exports';

import { CreateEditAttributionModel } from '../containers/Library/AttributionModel/Edit';
import { CreateEditBidOptimizer } from '../containers/Library/BidOptimizer/Edit';
import { CreateEditEmailRouter } from '../containers/Library/EmailRouter/Edit';
import { CreateEditVisitAnalyzer } from '../containers/Library/VisitAnalyzer/Edit';
import { CreateEditRecommender } from '../containers/Library/Recommender/Edit';

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
];

export default campaignsRoutes;
