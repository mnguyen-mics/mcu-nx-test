import { EditDisplayCreativePage } from '../containers/Creative/DisplayAds/Edit';
import DisplayAdsPage from '../containers/Creative/DisplayAds/List/DisplayAdsPage';
import { CreateEmailTemplate } from '../containers/Creative/EmailTemplates/Edit';
import { EmailTemplatesPage } from '../containers/Creative/EmailTemplates/List';

import {
  NavigatorRoute,
  NavigatorDefinition,
  generateRoutesFromDefinition,
} from './domain';

export const creativesDefinition: NavigatorDefinition = {
  creativeDisplayList: {
    path: '/creatives/display',
    layout: 'main',
    contentComponent: DisplayAdsPage,
    requiredFeature: 'creatives-display',
  },
  creativeDisplayCreation: {
    path: '/creatives/display/create',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
    requiredFeature: 'creatives-display',
  },
  creativeDisplayEdit: {
    path: '/creatives/display/edit/:creativeId(\\d+)',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
    requiredFeature: 'creatives-display',
  },
  creativeEmailList: {
    path: '/creatives/email',
    layout: 'main',
    contentComponent: EmailTemplatesPage,
    requiredFeature: 'creatives-email',
  },
  creativeEmailCreation: {
    path: '/creatives/email/create',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
    requiredFeature: 'creatives-email',
  },
  creativeEmailEdition: {
    path: '/creatives/email/:creativeId(\\d+)/edit',
    layout: 'edit',
    editComponent: CreateEmailTemplate,
    requiredFeature: 'creatives-email',
  },
};

export const creativeRoutes: NavigatorRoute[] = generateRoutesFromDefinition(
  creativesDefinition,
);
