import AssetList from '../containers/Library/Asset/List';
import KeywordList from '../containers/Library/Keyword/List';
import PlacementList from '../containers/Library/Placement/List';
import Catalog from '../containers/Library/Catalog';
import PlacementListPage from '../containers/Library/Placement/Edit/PlacementListPage';
import KeywordListPage from '../containers/Library/Keyword/Edit/KeywordListPage';
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
  //           CATALOG
  // ========================================
  {
    path: '/library/catalog',
    layout: 'main',
    ...Catalog,
  },
];

export default campaignsRoutes;
