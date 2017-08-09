import {
  DisplayAdsActionBar,
  DisplayAdsList,
} from '../containers/Creative/DisplayAds/List';

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
    path: '/creatives/email',
    layout: 'main',
    contentComponent: EmailList,
    actionBarComponent: EmailActionBar,
  },
];

export default creativesRoutes;
