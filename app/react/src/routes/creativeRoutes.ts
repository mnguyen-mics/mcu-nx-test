import { EditDisplayCreativePage } from '../containers/Creative/DisplayAds/Edit';

import DisplayAdsPage from '../containers/Creative/DisplayAds/List/DisplayAdsPage';

import NativeAdsPage from '../containers/Creative/NativeAds/List/NativeAdsPage';

import { CreateEmailTemplate } from '../containers/Creative/EmailTemplates/Edit';

import { EmailTemplatesPage } from '../containers/Creative/EmailTemplates/List';

import EditNativeCreativePage from '../containers/Creative/NativeAds/Edit/EditNativeCreativePage';

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
  creativeNativeList: {
    path: '/creatives/native',
    layout: 'main',
    contentComponent: NativeAdsPage,
    requiredFeature: 'creatives-native',
  },
  creativeNativeCreation: {
    path: '/creatives/native/create',
    layout: 'edit',
    editComponent: EditNativeCreativePage,
    requiredFeature: 'creatives-native',
  },
  creativeNativeEdit: {
    path: '/creatives/native/edit/:nativeId(\\d+)',
    layout: 'edit',
    editComponent: EditNativeCreativePage,
    requiredFeature: 'creatives-native',
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
