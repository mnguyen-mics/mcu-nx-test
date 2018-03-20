import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Report/Edit';
import Exports from '../containers/Library/Exports/Dashboard/Exports';
import ExportsList from '../containers/Library/Exports/List';
import { RouteEdit, RouteStandard } from './routes';

const datastudioRoutes: Array<RouteEdit | RouteStandard> = [
  {
    path: '/datastudio/query-tool',
    layout: 'main',
    contentComponent: QueryToolPage,
  },
  {
    path: '/datastudio/report',
    layout: 'edit',
    editComponent: CreateReportPage,
  },
  // ========================================
  //           Exports
  // ========================================
  {
    path: '/datastudio/exports',
    layout: 'main',
    ...ExportsList,
  },
  {
    path: '/datastudio/exports/:exportId(\\d+)',
    layout: 'main',
    contentComponent: Exports,
  },
];

export default datastudioRoutes;
