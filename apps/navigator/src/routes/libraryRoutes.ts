import AssetList from '../containers/Library/Asset/List';

import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const libraryDefinition: NavigatorDefinition = {
  // ========================================
  //            Assets
  // ========================================
  libraryAssetList: {
    path: '/library/assets',
    layout: 'main',
    contentComponent: AssetList.contentComponent,
    requiredFeature: 'library-assets',
  },
};

export const libraryRoutes: NavigatorRoute[] = generateRoutesFromDefinition(libraryDefinition);
