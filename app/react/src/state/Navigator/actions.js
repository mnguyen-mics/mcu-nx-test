import { createAction } from '../../utils/ReduxHelper';

import {
  NAVIGATOR_GET_VERSION
 } from '../action-types';

const getAppVersion = {
  request: createAction(NAVIGATOR_GET_VERSION.REQUEST),
  success: createAction(NAVIGATOR_GET_VERSION.SUCCESS),
  failure: createAction(NAVIGATOR_GET_VERSION.FAILURE)
};

export {
  getAppVersion
};
