import { createAction } from 'redux-actions';

import { CONNECTED_USER, WORKSPACE, FETCH_COOKIES, GET_LOGO, PUT_LOGO } from '../action-types';

const getConnectedUser = {
  request: createAction(CONNECTED_USER.REQUEST),
  success: createAction(CONNECTED_USER.SUCCESS),
  failure: createAction(CONNECTED_USER.FAILURE),
};

const putLogo = {
  request: createAction(PUT_LOGO.REQUEST),
  success: createAction(PUT_LOGO.SUCCESS),
  failure: createAction(PUT_LOGO.FAILURE),
};

const getWorkspace = {
  request: createAction(WORKSPACE.REQUEST),
  success: createAction(WORKSPACE.SUCCESS),
  failure: createAction(WORKSPACE.FAILURE),
};

const getCookies = {
  request: createAction(FETCH_COOKIES.REQUEST),
  success: createAction(FETCH_COOKIES.SUCCESS),
  failure: createAction(FETCH_COOKIES.FAILURE),
};

const getLogo = {
  request: createAction(GET_LOGO.REQUEST),
  success: createAction(GET_LOGO.SUCCESS),
  failure: createAction(GET_LOGO.FAILURE),
};

export { getConnectedUser, getWorkspace, getLogo, getCookies, putLogo };
