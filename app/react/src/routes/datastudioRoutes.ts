import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Datastudio/Report/Edit';
import Exports from '../containers/Datastudio/Exports/Dashboard/Exports';
import ExportsList from '../containers/Datastudio/Exports/List';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';
import ExportEditPage from '../containers/Datastudio/Exports/Edit/ExportEditPage';


export const datastudioDefinition: NavigatorDefinition = {
  datastudioQueryTool: {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'datastudio.query_tool',
    requireDatamart: true,
  },
  datastudioReport: {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
    requiredFeature: 'datastudio.report',
  },
  // ========================================
  //           Exports
  // ========================================
  datastudioExportList: {
    path: '/datastudio/exports',
    layout: 'main',
    contentComponent: ExportsList.contentComponent,
    actionBarComponent: ExportsList.actionBarComponent,
    requiredFeature: 'datastudio.exports',
    requireDatamart: true,
  },
  datastudioExportDashboard: {
    path: '/datastudio/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
    requiredFeature: 'datastudio.exports',
    requireDatamart: true,
  },
  datastudioExportCreation: {
    path: '/datastudio/exports/create',
    layout: 'edit',
    editComponent: ExportEditPage,
    requiredFeature: 'datastudio.exports',
    requireDatamart: true,
  },
  datastudioExportEdition: {
    path: '/datastudio/exports/:exportId/edit',
    layout: 'edit',
    editComponent: ExportEditPage,
    requiredFeature: 'datastudio.exports',
    requireDatamart: true,
  }
}

export const datastudioRoutes: NavigatorRoute[] = generateRoutesFromDefinition(datastudioDefinition)
