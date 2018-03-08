import React from 'react';
import campaignRoutes from './campaignRoutes.js';
import automationRoutes from './automationRoutes.js';
import audienceRoutes from './audienceRoutes.js';
import creativeRoutes from './creativeRoutes';
import libraryRoutes from './libraryRoutes.js';
import settingsRoutes from './settingsRoutes';
import accountRoutes from './accountRoutes.js';
import datastudioRoutes from './datastudioRoutes';
import analyticsRoutes from './analyticsRoutes.js';
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

export interface RouteDef {
  path: string;
  layout: string;
  contentComponent: React.ComponentClass;
  editComponent: React.ComponentClass;
  actionBarComponent: React.ComponentClass; 
}

const routes: any[] = [
  ...campaignRoutes,
  ...automationRoutes,
  ...audienceRoutes,
  ...creativeRoutes,
  ...libraryRoutes,
  ...settingsRoutes,
  ...accountRoutes,
  ...datastudioRoutes,
  ...analyticsRoutes,
];

export default routes;
