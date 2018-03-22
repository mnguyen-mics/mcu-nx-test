import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Report/Edit';
import Exports from '../containers/Library/Exports/Dashboard/Exports';
import ExportsList from '../containers/Library/Exports/List';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const datastudioDefinition: NavigatorDefinition = {
  datastudioQueryTool: {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'datastudio.query_tool',
    requireDatamart: true
  },
  datastudioReport: {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
    requiredFeature: 'datastudio.report'
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
}

export const datastudioRoutes: NavigatorRoute[] = generateRoutesFromDefinition(datastudioDefinition)
