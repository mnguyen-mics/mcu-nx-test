import { combineReducers } from 'redux';

import emailTemplates from './Emails/reducer';
import displayCreatives from './Display/reducer';

const creatives = combineReducers({
  displayCreatives,
  emailTemplates,
});

export default { creatives };
