import AssetList from '../containers/Library/Asset/List';
import KeywordList from '../containers/Library/Keyword/List';
import PlacementList from '../containers/Library/Placement/List';
import Catalog from '../containers/Library/Catalog';
import PlacementListPage from '../containers/Library/Placement/Edit/PlacementListPage';

import KeywordListPage from '../containers/Library/Keyword/Edit/KeywordListPage';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const libraryDefinition: NavigatorDefinition = {
 // ========================================
  //            Placements
  // ========================================
  libraryPlacementList: {
    path: '/library/placements',
    layout: 'main',
    actionBarComponent: PlacementList.actionBarComponent,
    contentComponent: PlacementList.contentComponent,
    requiredFeature: 'library.placements'
  },
  libraryPlacementEdition: {
    path: '/library/placementlists/:placementListId(\\d+)',
    layout: 'edit',
    editComponent: PlacementListPage,
    requiredFeature: 'library.placements'
  },
  libraryPlacementCreation: {
    path: '/library/placementlists',
    layout: 'edit',
    editComponent: PlacementListPage,
    requiredFeature: 'library.placements'
  },
  // ========================================
  //            Keywords
  // ========================================
  libraryKeywordList: {
    path: '/library/keywordslists',
    layout: 'main',
    actionBarComponent: KeywordList.actionBarComponent,
    contentComponent: KeywordList.contentComponent,
    requiredFeature: 'library.keywords'
  },
  libraryKeywordEdition: {
    path: '/library/keywordslist/:keywordsListId',
    layout: 'edit',
    editComponent: KeywordListPage,
    requiredFeature: 'library.keywords'
  },
  libraryKeywordCreation: {
    path: '/library/keywordslist',
    layout: 'edit',
    editComponent: KeywordListPage,
    requiredFeature: 'library.keywords'
  },
  // ========================================
  //            Assets
  // ========================================
  libraryAssetList: {
    path: '/library/assets',
    layout: 'main',
    contentComponent: AssetList.contentComponent,
    requiredFeature: 'library.assets'
  },
  
  // ========================================
  //           CATALOG
  // ========================================
  libraryCatalogList: {
    path: '/library/catalog',
    layout: 'main',
    actionBarComponent: Catalog.actionBarComponent,
    contentComponent: Catalog.contentComponent,
    requiredFeature: 'library.catalog'
  },
}


export const libraryRoutes: NavigatorRoute[] = generateRoutesFromDefinition(libraryDefinition)
