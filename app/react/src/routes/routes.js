import campaignRoutes from './campaignRoutes';
import automationRoutes from './automationRoutes';
import audienceRoutes from './audienceRoutes';
import creativeRoutes from './creativeRoutes';
import libraryRoutes from './libraryRoutes';
import settingsRoutes from './settingsRoutes';
import accountRoutes from './accountRoutes';

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
const routes = [
  ...campaignRoutes,
  ...automationRoutes,
  ...audienceRoutes,
  ...creativeRoutes,
  ...libraryRoutes,
  ...settingsRoutes,
  ...accountRoutes,
];

export default routes;
