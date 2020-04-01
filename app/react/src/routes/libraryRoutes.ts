import AssetList from '../containers/Library/Asset/List';
import KeywordList from '../containers/Library/Keyword/List';
import PlacementList from '../containers/Library/Placement/List';
import Catalog from '../containers/Library/Catalog';
import PlacementListPage from '../containers/Library/Placement/Edit/PlacementListPage';

import KeywordListPage from '../containers/Library/Keyword/Edit/KeywordListPage';
import DealListPage from '../containers/Library/Deal/Edit/DealListPage';
import DealList from '../containers/Library/Deal/List'
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const libraryDefinition: NavigatorDefinition = {
 // ========================================
  //            Placements
  // ========================================
  libraryPlacementList: {
    path: '/library/placementlist',
    layout: 'main',
    actionBarComponent: PlacementList.actionBarComponent,
    contentComponent: PlacementList.contentComponent,
    requiredFeature: 'library-placements'
  },
  libraryPlacementEdition: {
    path: '/library/placementlist/:placementListId(\\d+)/edit',
    layout: 'edit',
    editComponent: PlacementListPage,
    requiredFeature: 'library-placements'
  },
  libraryPlacementCreation: {
    path: '/library/placementlist/create',
    layout: 'edit',
    editComponent: PlacementListPage,
    requiredFeature: 'library-placements'
  },
  // ========================================
  //            Keywords
  // ========================================
  libraryKeywordList: {
    path: '/library/keywordslist',
    layout: 'main',
    actionBarComponent: KeywordList.actionBarComponent,
    contentComponent: KeywordList.contentComponent,
    requiredFeature: 'library-keywords'
  },
  libraryKeywordEdition: {
    path: '/library/keywordslist/:keywordsListId(\\d+)/edit',
    layout: 'edit',
    editComponent: KeywordListPage,
    requiredFeature: 'library-keywords'
  },
  libraryKeywordCreation: {
    path: '/library/keywordslist/create',
    layout: 'edit',
    editComponent: KeywordListPage,
    requiredFeature: 'library-keywords'
  },
   // ========================================
  //            DEALLIST
  // ========================================
  libraryDealList: {
    path: '/library/deallist',
    layout: 'main',
    actionBarComponent: DealList.actionBarComponent,
    contentComponent: DealList.contentComponent,
    requiredFeature: 'library-keywords'
  },
  libraryDealEdition: {
    path: '/library/deallist/:dealListId(\\d+)/edit',
    layout: 'edit',
    editComponent: DealListPage,
    requiredFeature: 'library-keywords'
  },
  libraryDealCreation: {
    path: '/library/deallist/create',
    layout: 'edit',
    editComponent: DealListPage,
    requiredFeature: 'library-keywords'
  },

  // ========================================
  //            Assets
  // ========================================
  libraryAssetList: {
    path: '/library/assets',
    layout: 'main',
    contentComponent: AssetList.contentComponent,
    requiredFeature: 'library-assets'
  },
  
  // ========================================
  //           CATALOG
  // ========================================
  libraryCatalogList: {
    path: '/library/catalog',
    layout: 'main',
    actionBarComponent: Catalog.actionBarComponent,
    contentComponent: Catalog.contentComponent,
    requiredFeature: 'library-catalog',
    requireDatamart: true,
  },
}


export const libraryRoutes: NavigatorRoute[] = generateRoutesFromDefinition(libraryDefinition)