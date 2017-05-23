import { createAction } from '../../utils/ReduxHelper';

import {
  LOG_IN,
  LOG_OUT
} from '../action-types';

const logIn = {
  request: createAction(LOG_IN.REQUEST, undefined, (_, meta) => meta),
  success: createAction(LOG_IN.SUCCESS),
  failure: createAction(LOG_IN.FAILURE)
};

const logOut = createAction(LOG_OUT, undefined, (_, meta) => meta);

export {
  logIn,
  logOut
};
