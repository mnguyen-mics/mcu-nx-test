import {
  DisplayAdsActionBar,
  DisplayAdsList,
} from '../containers/Creative/DisplayAds/List';

import {
  CreateDisplayCreativePage,
  EditDisplayCreativePage,
} from '../containers/Creative/DisplayAds/Edit';

import {
  CreateEmailTemplate
} from '../containers/Creative/EmailTemplates/Edit/index.ts';

import {
  EmailActionBar,
  EmailList,
} from '../containers/Creative/EmailTemplates/List';

const creativesRoutes = [
  {
    path: '/creatives/display',
    layout: 'main',
    contentComponent: DisplayAdsList,
    actionBarComponent: DisplayAdsActionBar,
  },
  {
    path: '/creatives/display/create',
    layout: 'edit',
    editComponent: CreateDisplayCreativePage,
  },
  {
    path: '/creatives/display/edit/:creativeId(\\d+)',
    layout: 'edit',
    editComponent: EditDisplayCreativePage,
  },
  {
    path: '/creatives/email',
    layout: 'main',
    contentComponent: EmailList,
    actionBarComponent: EmailActionBar,
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
