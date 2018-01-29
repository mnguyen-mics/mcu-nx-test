import QueryToolPage from '../containers/Datastudio/QueryTool/QueryToolPage';
import { CreateReportPage } from '../containers/Report/Edit';

const datastudioRoutes = [
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
];

export default datastudioRoutes;
