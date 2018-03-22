import { automationRoutes } from './automationRoutes';
import { campaignRoutes } from './campaignRoutes';
import { audienceRoutes } from './audienceRoutes';
import { creativeRoutes } from './creativeRoutes';
import { libraryRoutes } from './libraryRoutes';
import { settingsRoutes } from './settingsRoutes';
import { datastudioRoutes } from './datastudioRoutes';
import { analyticsRoutes } from './analyticsRoutes';

import { NavigatorRoute } from './domain'
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
  ...analyticsRoutes,
];

export default routes;
