import {
  DisplayAdsActionBar,
  DisplayAdsList,
} from '../containers/Creative/DisplayAds/List';

import {
  // CreateCreativePage,
} from '../containers/Creative/DisplayAds/Edit';

import {
  EditDisplayCreativePage,
} from '../containers/Creative/DisplayAds/Edit/index'

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
    contentComponent: EmailList,
    actionBarComponent: EmailActionBar,
  },
];

export default creativesRoutes;
