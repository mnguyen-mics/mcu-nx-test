import { createAction } from '../../utils/ReduxHelper';

import {
  CONNECTED_USER,
  WORKSPACE,
  GET_LOGO,
  PUT_LOGO
} from '../action-types';

const getConnectedUser = {
  request: createAction(CONNECTED_USER.REQUEST),
  success: createAction(CONNECTED_USER.SUCCESS),
  failure: createAction(CONNECTED_USER.FAILURE)
};

const putLogo = {
  request: createAction(PUT_LOGO.REQUEST),
  success: createAction(PUT_LOGO.SUCCESS),
  failure: createAction(PUT_LOGO.FAILURE)
};

const getWorkspace = {
  request: createAction(WORKSPACE.REQUEST),
  success: createAction(WORKSPACE.SUCCESS),
  failure: createAction(WORKSPACE.FAILURE)
};

const getLogo = createAction(GET_LOGO);

export {
  getConnectedUser,
  getWorkspace,
  getLogo,
  putLogo
};
