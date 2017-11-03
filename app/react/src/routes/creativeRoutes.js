import {
  DisplayAdsActionBar,
  DisplayAdsList,
} from '../containers/Creative/DisplayAds/List';

import {
  CreateDisplayCreativePage,
  EditDisplayCreativePage,
} from '../containers/Creative/DisplayAds/Edit';

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
];

export default creativesRoutes;
