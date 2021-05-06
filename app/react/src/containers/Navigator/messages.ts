import { defineMessages } from 'react-intl';

export default defineMessages({
  adBlock: {
    id: 'errors.adBlock',
    defaultMessage:
      'It appears you have an adblocker activated, in order to access mediarithmics navigator you need to disable your adblocker. Please contact the support if the issue persists afterwards',
  },
  generic: {
    id: 'errors.generic',
    defaultMessage: 'Oops, please try to reload the page or contact your support',
  },
  notFound: {
    id: 'errors.notFound',
    defaultMessage: '404 not found',
  },
  noAccess: {
    id: 'errors.noAccess',
    defaultMessage:
      "You currently don't have the right to view this page, if you think this is a mistake, please contact your administrator.",
  },
});
