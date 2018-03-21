import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Report/Edit';
import Exports from '../containers/Library/Exports/Dashboard/Exports';
import ExportsList from '../containers/Library/Exports/List';
import { NavigatorRoute } from './routes';

const datastudioRoutes: NavigatorRoute[] = [
  {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
    requiredFeature: 'datastudio.query_tool',
    requireDatamart: true
  },
  {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
    requiredFeature: 'datastudio.report'
  },
  // ========================================
  //           Exports
  // ========================================
  {
    path: '/datastudio/exports',
    layout: 'main',
    contentComponent: ExportsList.contentComponent,
    actionBarComponent: ExportsList.actionBarComponent
  },
  {
    path: '/datastudio/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
  },
];

export default datastudioRoutes;
