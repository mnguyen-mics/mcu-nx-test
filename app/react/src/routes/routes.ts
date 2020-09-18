import { automationRoutes } from './automationRoutes';
import { campaignRoutes } from './campaignRoutes';
import { audienceRoutes } from './audienceRoutes';
import { creativeRoutes } from './creativeRoutes';
import { libraryRoutes } from './libraryRoutes';
import { settingsRoutes } from './settingsRoutes';
import { datastudioRoutes } from './datastudioRoutes';
import { marketplaceRoutes } from './marketplaceRoutes';
import { NavigatorRoute } from './domain'
import { featureFlagRoutes } from './featuresFlagRoutes';
import { createBrowserHistory } from 'history'
import { Modal } from 'antd';

const browserHistory = createBrowserHistory();

// router change
browserHistory.listen(() => {
  Modal.destroyAll();
});

/**
 * Route object definition
 * {
 *   {String} path exact url where components will render
 *   {String} layout define layout applied, available: main/edit
 *   {Component} contentComponent react component used in Component/MainLayout
 *   {Component} actionBarComponent react component used in Component/MainLayout
 *   {Component} editComponent react component used in Component/EditLayout
 * }
 *
 * Usage: Navigator -> AuthenticatedRoute(path) -> LayoutManager(layout, components) -> Main/EditLayout(components)
 */

const routes: NavigatorRoute[] = [
  ...campaignRoutes,
  ...automationRoutes,
  ...audienceRoutes,
  ...creativeRoutes,
  ...libraryRoutes,
  ...settingsRoutes,
  ...datastudioRoutes,
  ...marketplaceRoutes,
  ...featureFlagRoutes
];

export default routes;
