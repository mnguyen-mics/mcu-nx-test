import AssetList from '../containers/Library/Asset/List';
import KeywordList from '../containers/Library/Keyword/List';
import PlacementList from '../containers/Library/Placement/List';
import Catalog from '../containers/Library/Catalog';
import PlacementListPage from '../containers/Library/Placement/Edit/PlacementListPage';

import KeywordListPage from '../containers/Library/Keyword/Edit/KeywordListPage';
import { NavigatorRoute } from './routes';

const libraryRoutes: NavigatorRoute[] = [
  // ========================================
  //            Placements
  // ========================================
  {
    path: '/library/placements',
    layout: 'main',
    actionBarComponent: PlacementList.actionBarComponent,
    contentComponent: PlacementList.contentComponent
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
    actionBarComponent: KeywordList.actionBarComponent,
    contentComponent: KeywordList.contentComponent
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
    contentComponent: AssetList.contentComponent
  },
  
  // ========================================
  //           CATALOG
  // ========================================
  {
    path: '/library/catalog',
    layout: 'main',
    actionBarComponent: Catalog.actionBarComponent,
    contentComponent: Catalog.contentComponent
  },
  
];

export default libraryRoutes;
