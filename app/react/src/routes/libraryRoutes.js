import {
  AssetsActionbar,
  AssetsTableView
} from '../containers/Library/AssetsFiles/List';

import {
  KeywordActionBar,
  KeywordTable
} from '../containers/Library/Keyword/List';

import {
  PlacementActionBar,
  PlacementTable
} from '../containers/Library/Placement/List';

const campaignsRoutes = [
  {
    path: '/library/placements',
    layout: 'main',
    contentComponent: PlacementTable,
    actionBarComponent: PlacementActionBar
  },
  {
    path: '/library/keywords',
    layout: 'main',
    contentComponent: KeywordTable,
    actionBarComponent: KeywordActionBar
  },
  {
    path: '/library/assets',
    layout: 'main',
    contentComponent: AssetsTableView,
    actionBarComponent: AssetsActionbar
  }
];

export default campaignsRoutes;
