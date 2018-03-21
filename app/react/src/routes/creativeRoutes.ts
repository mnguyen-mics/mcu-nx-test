import { EditDisplayCreativePage } from '../containers/Creative/DisplayAds/Edit';

import DisplayAdsPage from '../containers/Creative/DisplayAds/List/DisplayAdsPage';

import { CreateEmailTemplate } from '../containers/Creative/EmailTemplates/Edit';

import {
  EmailListPage,
} from '../containers/Creative/EmailTemplates/List';
import { NavigatorRoute } from './routes';

const creativesRoutes: NavigatorRoute[] = [
  {
    path: '/creatives/display',
    layout: 'main',
    contentComponent: DisplayAdsPage,
    requiredFeature: 'creatives.display'
  },
  {
    path: '/creatives/display/create',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
    requiredFeature: 'creatives.display'
  },
  {
    path: '/creatives/display/edit/:creativeId(\\d+)',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
    requiredFeature: 'creatives.display'
  },
  {
    path: '/creatives/email',
    layout: 'main',
    contentComponent: EmailListPage,
    requiredFeature: 'creatives.email'
  },
  {
    path: '/creatives/email/create',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
    requiredFeature: 'creatives.email'
  },
  {
    path: '/creatives/email/:creativeId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
    requiredFeature: 'creatives.email'
  },
];

export default creativesRoutes;
