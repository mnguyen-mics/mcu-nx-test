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

import {
  buildWorkspaces,
  setActiveWorkspace,
  isReactUrl
} from './selectors';

const defaultSessionState = {
  user: {},
  activeWorkspace: {},
  workspaces: [],
  isReactUrl: false,
  authenticated: false,
  isFetching: false,
  isFetchingWorkspaces: false
};


const sessionState = (state = defaultSessionState, action) => {

  switch (action.type) {

    case SESSION_GET_ACCESS_TOKEN_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case SESSION_GET_ACCESS_TOKEN_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        access_token: action.response.data.access_token
      };
    case SESSION_GET_ACCESS_TOKEN_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };

    case SESSION_GET_CONNECTED_USER_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case SESSION_GET_CONNECTED_USER_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        user: action.response.data,
        authenticated: true
      };
    case SESSION_GET_CONNECTED_USER_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };

    case SESSION_GET_WORKSPACES_REQUEST:
      return {
        ...state,
        isFetchingWorkspaces: true
      };
    case SESSION_GET_WORKSPACES_REQUEST_SUCCESS:
      return {
        ...state,
        isFetchingWorkspaces: false,
        workspaces: buildWorkspaces([action.response.data].concat(state.user.workspaces))
      };
    case SESSION_GET_WORKSPACES_REQUEST_FAILURE:
      return {
        ...state,
        isFetchingWorkspaces: false,
        workspaces: defaultSessionState.workspaces
      };

    case SESSION_INIT_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.workspaces, state.user.default_workspace, true)
      };

    case SESSION_SWITCH_WORKSPACE:
      return {
        ...state,
        activeWorkspace: setActiveWorkspace(action.workspace, state.workspaces, state.user.default_workspace)
      };

    case SESSION_IS_REACT_URL:
      return {
        ...state,
        isReactUrl: isReactUrl(action.url)
      };

    case SESSION_LOGOUT:
      return defaultSessionState;

    default:
      return state;
  }

};

const SessionStateReducers = {
  sessionState
};

export default SessionStateReducers;
