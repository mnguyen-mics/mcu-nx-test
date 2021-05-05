import AssetList from '../containers/Library/Asset/List';
import Catalog from '../containers/Library/Catalog';

import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const libraryDefinition: NavigatorDefinition = {
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