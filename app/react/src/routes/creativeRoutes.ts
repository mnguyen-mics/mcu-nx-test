import { EditDisplayCreativePage } from '../containers/Creative/DisplayAds/Edit';

import DisplayAdsPage from '../containers/Creative/DisplayAds/List/DisplayAdsPage';

import { CreateEmailTemplate } from '../containers/Creative/EmailTemplates/Edit';

import {
  EmailListPage,
} from '../containers/Creative/EmailTemplates/List';
import { RouteStandard, RouteEdit } from './routes';

const creativesRoutes: Array<RouteEdit | RouteStandard> = [
  {
    path: '/creatives/display',
    layout: 'main',
    contentComponent: DisplayAdsPage,
  },
  {
    path: '/creatives/display/create',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
  },
  {
    path: '/creatives/display/edit/:creativeId(\\d+)',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
  },
  {
    path: '/creatives/email',
    layout: 'main',
    contentComponent: EmailListPage,
  },
  {
    path: '/creatives/email/create',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
  },
  {
    path: '/creatives/email/:creativeId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
  },
];

export default creativesRoutes;
