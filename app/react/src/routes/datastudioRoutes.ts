import QueryToolPage from '../containers/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Report/Edit';
import Exports from '../containers/Exports/Dashboard/Exports';
import Imports from '../containers/Imports/Dashboard/Imports';
import ExportsList from '../containers/Exports/List';
import ImportsList from '../containers/Imports/List';
import {
  NavigatorRoute,
  NavigatorDefinition,
  generateRoutesFromDefinition,
} from './domain';
import ExportEditPage from '../containers/Exports/Edit/ExportEditPage';
import ImportEditPage from '../containers/Imports/Edit/ImportEditPage';

export const datastudioDefinition: NavigatorDefinition = {
  datastudioQueryTool: {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'datastudio-query_tool',
    requireDatamart: true,
  },
  datastudioReport: {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
    requiredFeature: 'datastudio-report',
  },
  // ========================================
  //           Exports
  // ========================================
  datastudioExportList: {
    path: '/datastudio/exports',
    layout: 'main',
    contentComponent: ExportsList.contentComponent,
    actionBarComponent: ExportsList.actionBarComponent,
    requiredFeature: 'datastudio-exports',
    requireDatamart: true,
  },
  datastudioExportDashboard: {
    path: '/datastudio/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
    requiredFeature: 'datastudio-exports',
    requireDatamart: true,
  },
  datastudioExportCreation: {
    path: '/datastudio/exports/create',
    layout: 'edit',
    editComponent: ExportEditPage,
    requiredFeature: 'datastudio-exports',
    requireDatamart: true,
  },
  datastudioExportEdition: {
    path: '/datastudio/exports/:exportId/edit',
    layout: 'edit',
    editComponent: ExportEditPage,
    requiredFeature: 'datastudio-exports',
    requireDatamart: true,
  },
  datastudioImportList: {
    path: '/datastudio/imports',
    layout: 'main',
    contentComponent: ImportsList.contentComponent,
    actionBarComponent: ImportsList.actionBarComponent,
    requiredFeature: 'datastudio-imports',
    requireDatamart: true,
  },
  datastudioImportEdition: {
    path: '/datastudio/datamart/:datamartId/imports/:importId/edit',
    layout: 'edit',
    editComponent: ImportEditPage,
    requiredFeature: 'datastudio-imports',
    requireDatamart: true,
  },
  datastudioImportCreation: {
    path: '/datastudio/imports/create',
    layout: 'edit',
    editComponent: ImportEditPage,
    requiredFeature: 'datastudio-imports',
    requireDatamart: true,
  },
  datastudioImportDashboard: {
    path: '/datastudio/datamart/:datamartId/imports/:importId(\\d+)',
    layout: 'main',
    contentComponent: Imports,
    requiredFeature: 'datastudio-imports',
    requireDatamart: true,
  },
};

export const datastudioRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  datastudioDefinition,
);
