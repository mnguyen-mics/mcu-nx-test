import {
  CreateReportPage,
} from '../containers/Report/Edit/index.tsx';

const reportRoutes = [
  {
    path: '/report/create',
    layout: 'edit',
    editComponent: CreateReportPage,
  }
];

export default reportRoutes;
