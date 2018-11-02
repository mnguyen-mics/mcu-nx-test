import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Datastudio/Report/Edit';
import Exports from '../containers/Datastudio/Exports/Dashboard/Exports';
import ExportsList from '../containers/Datastudio/Exports/List';
import { NavigatorRoute, NavigatorDefinition, generateRoutesFromDefinition } from './domain';

export const datastudioDefinition: NavigatorDefinition = {
  datastudioQueryTool: {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'datastudio.query_tool',
    requireDatamart: true,
    datalayer: {
      page_title: ''
    }
  },
  datastudioReport: {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
    requiredFeature: 'datastudio.report',
    datalayer: {
      page_title: ''
    }
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
    datalayer: {
      page_title: ''
    }
  },
  datastudioExportDashboard: {
    path: '/datastudio/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
    requiredFeature: 'datastudio.exports',
    requireDatamart: true,
    datalayer: {
      page_title: ''
    }
  },
}

export const datastudioRoutes: NavigatorRoute[] = generateRoutesFromDefinition(datastudioDefinition)
