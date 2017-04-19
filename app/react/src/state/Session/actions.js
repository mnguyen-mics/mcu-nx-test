import { CALL_API } from '../../middleware/api';

import {
  SESSION_GET_ACCESS_TOKEN_REQUEST,
  SESSION_GET_ACCESS_TOKEN_REQUEST_FAILURE,
  SESSION_GET_ACCESS_TOKEN_REQUEST_SUCCESS,
  SESSION_GET_CONNECTED_USER_REQUEST,
  SESSION_GET_CONNECTED_USER_REQUEST_FAILURE,
  SESSION_GET_CONNECTED_USER_REQUEST_SUCCESS,
  SESSION_GET_WORKSPACES_REQUEST,
  SESSION_GET_WORKSPACES_REQUEST_FAILURE,
  SESSION_GET_WORKSPACES_REQUEST_SUCCESS,
  SESSION_INIT_WORKSPACE,
  SESSION_IS_REACT_URL,
  SESSION_LOGOUT,
  SESSION_SWITCH_WORKSPACE
} from '../action-types';

const getAccessToken = () => {
  return (dispatch, getState) => {

    const {
      persistedState
    } = getState();

    const body = {
      refresh_token: persistedState.refresh_token
    };

    return dispatch({
      [CALL_API]: {
        method: 'post',
        endpoint: 'authentication/access_tokens',
        body,
        types: [SESSION_GET_ACCESS_TOKEN_REQUEST, SESSION_GET_ACCESS_TOKEN_REQUEST_FAILURE, SESSION_GET_ACCESS_TOKEN_REQUEST_SUCCESS]
      }
    });

  };
};

const getConnectedUser = () => {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        method: 'get',
        endpoint: 'connected_user',
        authenticated: true,
        types: [SESSION_GET_CONNECTED_USER_REQUEST, SESSION_GET_CONNECTED_USER_REQUEST_FAILURE, SESSION_GET_CONNECTED_USER_REQUEST_SUCCESS]
      }
    });
  };
};

const getWorkspaces = workspace => {
  return (dispatch, getState) => {

    const {
      sessionState: {
        user
      }
    } = getState();

    const organisationId = workspace.organisationId || user.default_workspace;

    return dispatch({
      [CALL_API]: {
        method: 'get',
        endpoint: `organisations/${organisationId}/workspace`,
        authenticated: true,
        types: [SESSION_GET_WORKSPACES_REQUEST, SESSION_GET_WORKSPACES_REQUEST_FAILURE, SESSION_GET_WORKSPACES_REQUEST_SUCCESS]
      }
    });
  };
};

const initActiveWorkspace = workspace => {
  return {
    type: SESSION_INIT_WORKSPACE,
    workspace
  };
};

const switchWorkspace = workspace => {
  return {
    type: SESSION_SWITCH_WORKSPACE,
    workspace
  };
};

const checkUrl = url => {
  return {
    type: SESSION_IS_REACT_URL,
    url
  };
};

const logout = () => {
  return {
    type: SESSION_LOGOUT
  };
};

export {
getAccessToken,
getConnectedUser,
getWorkspaces,
checkUrl,
initActiveWorkspace,
switchWorkspace,
logout
};
