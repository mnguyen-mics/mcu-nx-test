import { createAction } from 'redux-actions';

import { APP_STARTUP } from '../action-types';

const appStartup = {
  request: createAction(APP_STARTUP.REQUEST),
  success: createAction(APP_STARTUP.SUCCESS),
  failure: createAction(APP_STARTUP.FAILURE),
};

export { appStartup };
