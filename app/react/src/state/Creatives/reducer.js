import { combineReducers } from 'redux';

import emailTemplates from './Emails/reducer';
import displayCreatives from './Display/reducer';
import nativeCreatives from './Native/reducer';

const creatives = combineReducers({
  displayCreatives,
  emailTemplates,
  nativeCreatives
});

export default { creatives };
